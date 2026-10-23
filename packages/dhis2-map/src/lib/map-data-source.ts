import type { MapGeoFeature } from './models/map-geo-feature.model';

export interface MapSelection {
  dimension: string;
  items: readonly { id?: string; dimensionItem?: string }[];
}
export interface MapAnalytics {
  rows?: readonly Record<string, any>[];
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
    const response = await this.fetcher(
      `${baseUrl}/api/geoFeatures.json?ou=ou:${ou}&displayProperty=NAME`,
      { signal }
    );
    if (!response.ok)
      throw new Error(`GeoFeature request failed with ${response.status}`);
    return response.json();
  }
  loadAnalytics(
    selections: readonly MapSelection[],
    signal?: AbortSignal
  ): Promise<MapAnalytics | null> {
    return this.analyticsLoader(selections, signal);
  }
}
