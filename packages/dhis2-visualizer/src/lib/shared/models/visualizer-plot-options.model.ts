interface IVisualizationPlotOptions {
  height: string;
}
export class VisualizerPlotOptions {
  height!: string;
  constructor(options?: IVisualizationPlotOptions) {
    this.height = options?.height || '500px';
  }

  setHeight(height: string) {
    this.height = height;
    return this;
  }
}
