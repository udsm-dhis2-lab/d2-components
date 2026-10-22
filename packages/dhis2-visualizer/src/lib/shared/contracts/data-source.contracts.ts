export interface AnalyticsHeader {
  name: string;
  column?: string;
  valueType?: string;
  hidden?: boolean;
  meta?: boolean;
}

export interface AnalyticsMetadataItem {
  name?: string;
  [property: string]: unknown;
}

export interface AnalyticsMetadata {
  dimensions?: Readonly<Record<string, readonly string[]>>;
  items?: Readonly<Record<string, AnalyticsMetadataItem>>;
  names?: Readonly<Record<string, string>>;
  [dimension: string]: unknown;
}

export interface AnalyticsResponse {
  headers: readonly AnalyticsHeader[];
  rows: readonly (readonly string[])[];
  metaData: AnalyticsMetadata;
}

export interface AnalyticsDimensionSelection {
  dimension: string;
  items: readonly string[];
}

export interface AnalyticsQuery {
  selections: readonly AnalyticsDimensionSelection[];
  relativePeriodDate?: string;
  parameters?: Readonly<Record<string, string | number | boolean>>;
}

export interface VisualizationDataSource {
  getAnalytics(
    query: AnalyticsQuery,
    signal?: AbortSignal
  ): Promise<AnalyticsResponse>;
}

export interface HttpResponse<T> {
  data: T;
  status?: number;
}

export interface VisualizationHttpClient {
  get<T>(url: string, signal?: AbortSignal): Promise<HttpResponse<T>>;
}
