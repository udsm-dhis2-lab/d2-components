import type { MapGeoFeature } from './models/map-geo-feature.model';

export interface MapSelection {
  dimension: string;
  items: readonly { id?: string; dimensionItem?: string }[];
}
export interface MapAnalytics {
  rows?: readonly Record<string, any>[];
}

/** Narrow DHIS2 analytics adapter: map joins need only OU identity and value. */
export function normalizeMapAnalytics(input: unknown): MapAnalytics {
  if (input == null) return { rows: [] };
  const wrapper = input as { data?: unknown; _data?: unknown };
  const candidate = (wrapper.data ?? wrapper._data ?? input) as {
    headers?: readonly { name?: string }[];
    rows?: readonly unknown[];
  };
  if (!candidate || !Array.isArray(candidate.rows))
    throw new TypeError('Map analytics must contain rows');
  const first = candidate.rows[0];
  if (!Array.isArray(first)) {
    return { rows: candidate.rows.map((row) => {
      if (!row || typeof row !== 'object') throw new TypeError('Map analytics row must be an object');
      return row as Record<string, unknown>;
    }) };
  }
  const ouIndex = candidate.headers?.findIndex((header) => header.name === 'ou') ?? -1;
  const valueIndex = candidate.headers?.findIndex((header) => header.name === 'value') ?? -1;
  if (ouIndex < 0 || valueIndex < 0)
    throw new TypeError('Map analytics array rows require named ou and value headers');
  return { rows: candidate.rows.map((row) => {
    if (!Array.isArray(row)) throw new TypeError('Map analytics rows must use one shape');
    const rawValue = row[valueIndex];
    const parsed = rawValue == null || rawValue === '' ? null : Number(rawValue);
    return { ou: { id: String(row[ouIndex] ?? '') },
      value: parsed != null && Number.isFinite(parsed) ? parsed : null };
  }) };
}
export interface MapDataSource {
  loadGeoFeatures(
    selections: readonly MapSelection[],
    baseUrl: string,
    signal?: AbortSignal
  ): Promise<MapGeoFeature[]>;
  loadAnalytics(
    selections: readonly MapSelection[],
    signal?: AbortSignal
  ): Promise<MapAnalytics | null>;
}
export class FetchMapDataSource implements MapDataSource {
  constructor(
    private readonly analyticsLoader: MapDataSource['loadAnalytics'],
    private readonly fetcher: typeof fetch = fetch
  ) {}
  async loadGeoFeatures(
    selections: readonly MapSelection[],
    baseUrl: string,
    signal?: AbortSignal
  ): Promise<MapGeoFeature[]> {
    const ou = selections
      .filter(({ dimension }) => dimension === 'ou')
      .flatMap(({ items }) =>
        items.map((item) => item.dimensionItem || item.id).filter(Boolean)
      )
      .join(';');
    const response = await this.fetcher.call(globalThis,
      `${baseUrl}/api/geoFeatures.json?ou=ou:${ou}&displayProperty=NAME`,
      { signal }
    );
    if (!response.ok)
      throw new Error(`GeoFeature request failed with ${response.status}`);
    return response.json();
  }
  async loadAnalytics(
    selections: readonly MapSelection[],
    signal?: AbortSignal
  ): Promise<MapAnalytics | null> {
    return normalizeMapAnalytics(await this.analyticsLoader(selections, signal));
  }
}
