import { DownloadFormat } from './download-format.model';
import { VisualizationConfiguration } from './visualization-configuration.model';

export interface Visualizer {
  draw: () => void;
  download: (downloadFormat: DownloadFormat) => void;
}

export class BaseVisualizer {
  protected _id!: string;
  protected _data: any;
  protected _config?: VisualizationConfiguration;
  protected _dataSelections: any;
  protected _trackedEntityInstances?: any[];
  protected _program: any;
  /**
   *
   * @param id
   * @returns
   */
  setId(id: string) {
    this._id = id;
    return this;
  }

  /**
   *
   * @param data
   * @returns
   */
  setData(data: any) {
    this._data = data;
    return this;
  }

  /**
   *
   * @param tracked entity instances
   * @returns
   */
  setTrackedEntityInstances(trackedEntityInstances?: any[]) {
    this._trackedEntityInstances = trackedEntityInstances;
    return this;
  }

  /**
   *
   * @param program
   * @returns
   */
  setProgram(program: any) {
    this._program = program;
    return this;
  }

  /**
   *
   * @param config
   * @returns
   */
  setConfig(config: VisualizationConfiguration) {
    this._config = config;
    return this;
  }

  /**
   * @description Set data selection criterias
   * @param dataSelections {any[]}
   * @returns {D2Visualizer}
   */
  setSelections(dataSelections: any[]) {
    this._dataSelections = dataSelections;
    return this;
  }

  /**
   *
   * @param downloadFormat
   */
  download(downloadFormat: DownloadFormat) {
    const filename = this._config?.title || 'chart-data';
  }
}
