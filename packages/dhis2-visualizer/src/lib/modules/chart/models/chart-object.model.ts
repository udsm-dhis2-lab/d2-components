import { AnalyticsResult } from '@iapps/function-analytics';
import { ChartColor } from './chart-color.model';
import { ChartTitle } from './chart-title.model';
import {
  ChartOption,
  ChartPlotOptions,
  ChartRenderOptions,
  ChartTooltipOptions,
} from './chart-option.model';
import { ChartXAxis } from './chart-x-axis.model';

export class ChartObject {
  title: Partial<ChartTitle>;
  chart: ChartRenderOptions;
  colors = new ChartColor().colors;
  plotOptions: { [type: string]: ChartPlotOptions };
  tooltip: ChartTooltipOptions;
  credits = {
    enabled: false,
  };
  exporting = this.#getExportingOptions();
  xAxis: ChartXAxis;

  constructor(analyticsResult: AnalyticsResult, config: any) {
    this.title = new ChartTitle(config, analyticsResult.metaData).title;

    const chartOption = new ChartOption(config);
    this.chart = chartOption.renderOptions;
    this.plotOptions = chartOption.plotOptions;
    this.tooltip = chartOption.tooltipOptions;

    this.xAxis = new ChartXAxis(config);
  }

  #getExportingOptions() {
    return {
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
    };
  }
}
