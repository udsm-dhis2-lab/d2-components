export type DownloadFormat = 'PNG' | 'CSV' | 'XLS';

export interface Visualizer {
  draw(): void | Promise<void>;
  download(format: DownloadFormat): void;
  dispose(): void | Promise<void>;
}

export class BaseVisualizer {
  protected _id!: string;
  protected _data: any;

  setId(id: string) {
    this._id = id;
    return this;
  }

  setData(data: any) {
    this._data = data;
    return this;
  }

  download(_format: DownloadFormat): void {
    // KPI cards do not currently expose a downloadable representation.
  }

  dispose(): void {
    // KPI cards do not retain resources outside their host element.
  }
}
