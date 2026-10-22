export type DownloadFormat = 'PNG' | 'CSV' | 'XLS';

export type ChartType =
  | 'COLUMN'
  | 'LINE'
  | 'BAR'
  | 'DOTTED'
  | 'PIE'
  | 'SINGLE_VALUE'
  | 'STACKED_COLUMN'
  | 'YEAR_OVER_YEAR_LINE'
  | 'STACKED_BAR'
  | 'AREA'
  | 'RADAR'
  | 'SOLIDGAUGE';

export interface AnalyticsResponse {
  headers: readonly { name: string; [key: string]: unknown }[];
  rows: readonly (readonly string[])[];
  metaData: Record<string, any>;
}

export interface AnalyticsQuery {
  selections: readonly { dimension: string; items: readonly string[] }[];
  relativePeriodDate?: string;
  parameters?: Readonly<Record<string, string | number | boolean>>;
}

export interface VisualizationDataSource {
  getAnalytics(
    query: AnalyticsQuery,
    signal?: AbortSignal
  ): Promise<AnalyticsResponse>;
}

export interface Visualizer {
  draw(): void | Promise<void>;
  download(format: DownloadFormat): void;
  dispose(): void | Promise<void>;
}

export class BaseVisualizer {
  protected _id!: string;
  protected _data: any;
  protected _config: any;
  protected _dataSelections: any[] = [];

  setId(id: string) {
    this._id = id;
    return this;
  }
  setData(data: any) {
    this._data = data;
    return this;
  }
  setConfig(config: any) {
    this._config = config;
    return this;
  }
  setSelections(selections: any[]) {
    this._dataSelections = selections;
    return this;
  }
  download(_format: DownloadFormat): void {
    // Optional capability for renderers without export support.
  }
  dispose(): void {
    // Optional lifecycle hook for renderers without external resources.
  }
}

export function downloadCsv(filename: string, csv: string): void {
  const anchor = document.createElement('a');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
