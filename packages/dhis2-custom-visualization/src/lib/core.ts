export interface Visualizer { draw(): void | Promise<void>; dispose(): void }
export class BaseVisualizer {
  protected _id = ''; protected _data: any; protected _config: any;
  protected _dataSelections: any[] = []; protected _trackedEntityInstances?: any[];
  setId(id: string) { this._id = id; return this; }
  setData(data: any) { this._data = data; return this; }
  setConfig(config: any) { this._config = config; return this; }
  setSelections(selections: any[]) { this._dataSelections = selections; return this; }
  setTrackedEntityInstances(instances?: any[]) { this._trackedEntityInstances = instances; return this; }
  download(): void { /* unsupported by custom templates */ }
  dispose(): void { document.getElementById(this._id)?.replaceChildren(); }
}
