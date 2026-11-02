import type { MapGeoFeature } from './models/map-geo-feature.model';
import type { EventClusterViewport, EventQueryResponse, EventSelection } from './events/event-layer';
import { FetchEventDataSource } from './events/event-layer';

export interface MapSelection {
  dimension: string;
  items: readonly { id?: string; dimensionItem?: string }[];
}
export interface MapAnalytics {
  rows?: readonly Record<string, any>[];
}
export interface FacilityGroup {
  id: string;
  name: string;
  color?: string;
  symbol?: string;
  organisationUnitIds: readonly string[];
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
  loadEvents?(selection: EventSelection, baseUrl: string, signal?: AbortSignal): Promise<EventQueryResponse>;
  loadEventClusters?(selection: EventSelection, baseUrl: string, signal?: AbortSignal,
    viewport?: EventClusterViewport): Promise<EventQueryResponse>;
  loadGeoFeatures(
    selections: readonly MapSelection[],
    baseUrl: string,
    signal?: AbortSignal,
    options?: { includeGroupSets?: boolean }
  ): Promise<MapGeoFeature[]>;
  loadAnalytics(
    selections: readonly MapSelection[],
    signal?: AbortSignal
  ): Promise<MapAnalytics | null>;
  loadFacilityGroups?(
    groupSetId: string,
    baseUrl: string,
    signal?: AbortSignal
  ): Promise<FacilityGroup[]>;
}
export class FetchMapDataSource implements MapDataSource {
  constructor(
    private readonly analyticsLoader: MapDataSource['loadAnalytics'],
    private readonly fetcher: typeof fetch = fetch
  ) {}
  loadEvents(selection: EventSelection, baseUrl: string, signal?: AbortSignal): Promise<EventQueryResponse> {
    return new FetchEventDataSource(this.fetcher).load(selection, baseUrl, signal);
  }
  loadEventClusters(selection: EventSelection, baseUrl: string, signal?: AbortSignal,
    viewport?: EventClusterViewport): Promise<EventQueryResponse> {
    return new FetchEventDataSource(this.fetcher).loadClusters(selection, baseUrl, signal, viewport);
  }
  async loadGeoFeatures(
    selections: readonly MapSelection[],
    baseUrl: string,
    signal?: AbortSignal,
    options?: { includeGroupSets?: boolean }
  ): Promise<MapGeoFeature[]> {
    const ou = selections
      .filter(({ dimension }) => dimension === 'ou')
      .flatMap(({ items }) =>
        items.map((item) => item.dimensionItem || item.id).filter(Boolean)
      )
      .join(';');
    const response = await this.fetcher.call(globalThis,
      `${baseUrl}/api/geoFeatures.json?ou=ou:${ou}&displayProperty=NAME${options?.includeGroupSets ? '&includeGroupSets=true' : ''}`,
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
  async loadFacilityGroups(groupSetId: string, baseUrl: string, signal?: AbortSignal): Promise<FacilityGroup[]> {
    if (!/^[A-Za-z][A-Za-z0-9]{10}$/.test(groupSetId))
      throw new Error('Invalid organisation unit group set ID');
    const response = await this.fetcher.call(globalThis,
      `${baseUrl}/api/organisationUnitGroupSets/${groupSetId}.json?fields=name,organisationUnitGroups[id,name,color,symbol]`,
      { signal });
    if (!response.ok) throw new Error(`Facility group request failed with ${response.status}`);
    const payload = await response.json() as { organisationUnitGroups?: unknown };
    if (!Array.isArray(payload?.organisationUnitGroups))
      throw new TypeError('Facility group set must contain organisationUnitGroups');
    const groups = payload.organisationUnitGroups.map((raw: unknown) => {
      if (!raw || typeof raw !== 'object') throw new TypeError('Invalid facility group');
      const group = raw as Record<string, unknown>;
      if (typeof group['id'] !== 'string')
        throw new TypeError('Facility group requires id');
      return { id: group['id'], name: typeof group['name'] === 'string' ? group['name'] : group['id'],
        color: typeof group['color'] === 'string' ? group['color'] : undefined,
        symbol: typeof group['symbol'] === 'string' ? group['symbol'] : undefined,
        organisationUnitIds: (Array.isArray(group['organisationUnits']) ? group['organisationUnits'] : []).flatMap((item: unknown) =>
          item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string'
            ? [(item as { id: string }).id] : []),
      };
    });
    groups.sort((a, b) => a.name.localeCompare(b.name));
    let missingSymbolIndex = 0;
    return groups.map(group => ({ ...group,
      symbol: group.symbol || `${Math.min(25, 21 + missingSymbolIndex++)}.png`,
    }));
  }
}
