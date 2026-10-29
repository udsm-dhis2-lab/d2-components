export enum DownloadFormat {
  CSV = 'CSV',
  PNG = 'PNG',
}

export interface VisualizationDownloadOption {
  label: string;
  format: DownloadFormat;
}

export const VISUALIZATION_TYPES = [
  { type: 'COLUMN', description: 'Column', hiddenInList: false, icon: () => null },
  { type: 'LINE', description: 'Line', hiddenInList: false, icon: () => null },
  { type: 'SCATTER', description: 'Scatter', hiddenInList: false, icon: () => null },
  { type: 'HIDDEN', description: 'Hidden', hiddenInList: true, icon: () => null },
];

export class VisualizationDownloadOptionUtil {
  static get(): VisualizationDownloadOption[] {
    return [{ label: 'PNG', format: DownloadFormat.PNG }];
  }
}

export class VisualizerPlotOptions {
  height?: string;

  setHeight(height: string) {
    this.height = height;
    return this;
  }
}

export class D2Visualizer {
  static instances: D2Visualizer[] = [];
  config: Record<string, unknown> = {};
  visualizationType = 'COLUMN';
  plotOptions = new VisualizerPlotOptions();
  visualizer = { dispose: jest.fn() };
  download = jest.fn();
  draw = jest.fn(async () => this);
  setSelections = jest.fn(() => this);

  constructor() {
    D2Visualizer.instances.push(this);
  }

  setId() { return this; }
  setConfig(config: Record<string, unknown>) { this.config = config; return this; }
  setType(type: string) { this.visualizationType = type; return this; }
  setChartType() { return this; }
  setPlotOptions(options: VisualizerPlotOptions) { this.plotOptions = options; return this; }
  setTrackedEntityInstances() { return this; }
  setProgram() { return this; }
}
