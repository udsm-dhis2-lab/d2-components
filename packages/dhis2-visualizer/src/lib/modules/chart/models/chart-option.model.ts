export interface ChartRenderOptions {
  type: string;
  zoomType: string;
  renderTo: string;
}

export interface ChartPlotOptions {
  showInLegend: boolean;
  colorByPoint: boolean;
  pointPadding: number;
  groupPadding: number;
}

export interface ChartTooltipOptions {
  enabled: boolean;
}

export class ChartOption
  implements ChartRenderOptions, ChartPlotOptions, ChartTooltipOptions
{
  zoomType = 'xy';
  colorByPoint = false;
  pointPadding = 0;
  enabled = true;

  #config: any;

  constructor(config: any) {
    this.#config = config;
  }

  get renderTo(): string {
    return this.#config.renderId;
  }

  get showInLegend(): boolean {
    return !this.#config.hideLegend;
  }

  get groupPadding(): number {
    return this.#config.noSpaceBetweenColumns ? 0 : 0.1;
  }

  get type(): string {
    const splitedChartType: string[] = this.#config.type?.split('_');

    return splitedChartType.length > 1
      ? splitedChartType[1]
      : splitedChartType[0];
  }

  get renderOptions(): ChartRenderOptions {
    return {
      renderTo: this.renderTo,
      zoomType: this.zoomType,
      type: this.type,
    };
  }

  get plotOptions(): { [type: string]: ChartPlotOptions } {
    return {
      [this.type]: {
        showInLegend: this.showInLegend,
        colorByPoint: this.colorByPoint,
        pointPadding: this.pointPadding,
        groupPadding: this.groupPadding,
      },
    };
  }

  get tooltipOptions(): ChartTooltipOptions {
    return {
      enabled: this.enabled,
    };
  }
}
