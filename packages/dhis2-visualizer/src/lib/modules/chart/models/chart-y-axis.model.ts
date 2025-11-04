import { AnalyticsMetaData } from '@iapps/function-analytics';
import { ChartAxisLabel } from './chart-axis-label.model';
import { ChartAxisTitle } from './chart-axis-title.model';

export class ChartAxisPlotLine {
  color = '#000000';
  dashStyle = 'Solid';
  value: number;
  width = 2;
  zIndex = 1000;
  label: {
    text: string;
  };

  constructor(config: { lineValue: number; lineLabel: string }) {
    this.value = config?.lineValue;
    this.label = {
      text: config.lineLabel,
    };
  }
}

export class ChartYAxis {
  reversedStacks = false;
  min!: number;
  max!: number;
  allowDecimals: boolean;
  labels: ChartAxisLabel;
  title: ChartAxisTitle;
  plotLines: ChartAxisPlotLine[];

  constructor(config: any, yAxis?: any) {
    this.allowDecimals = yAxis?.decimals !== undefined;
    this.labels = new ChartAxisLabel(yAxis);
    this.title = new ChartAxisTitle(yAxis);
    this.min = config.rangeAxisMinValue;
    this.max = config.rangeAxisMaxValue;
    this.plotLines = this.#getPlotLines(config);
  }

  static getAxes(config: any): ChartYAxis[] {
    const yAxes: any[] = config.axes?.filter(
      (axis: Record<string, unknown>) => axis['type'] === 'RANGE'
    );

    if (yAxes.length === 0) {
      return [new ChartYAxis(config)];
    }
    return yAxes.map((yAxis) => new ChartYAxis(config, yAxis));
  }

  #getPlotLines(config: any) {
    const plotLines = [];

    if (config.targetLineValue) {
      plotLines.push(
        new ChartAxisPlotLine({
          lineLabel: config.targetLineLabel,
          lineValue: config.targetLineValue,
        })
      );
    }

    if (config.baseLineValue) {
      plotLines.push(
        new ChartAxisPlotLine({
          lineLabel: config.baseLineLabel,
          lineValue: config.baseLineValue,
        })
      );
    }

    return plotLines;
  }
}
