export interface Visualizer {
  draw(): void | Promise<void>;
  download(format: string): void;
  dispose(): void | Promise<void>;
}
export class BaseVisualizer {
  protected _id!: string;
  protected _baseUrl = '../../..';
  setId(id: string) {
    this._id = id;
    return this;
  }
  setBaseUrl(baseUrl: string) {
    this._baseUrl = baseUrl;
    return this;
  }
  download(_format: string): void {
    /* No current map download capability. */
  }
  dispose(): void {
    /* Optional provider lifecycle hook. */
  }
}
