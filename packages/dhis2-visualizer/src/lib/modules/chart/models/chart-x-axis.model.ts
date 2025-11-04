import { AnalyticsMetaData } from '@iapps/function-analytics';
import { ChartAxisLabel } from './chart-axis-label.model';
import { ChartAxisTitle } from './chart-axis-title.model';

export class ChartXAxis {
  allowDecimals: boolean;
  categories!: string[];
  title!: ChartAxisTitle;
  labels!: ChartAxisLabel;

  constructor(config: any, analyticsMetaData: AnalyticsMetaData) {
    const xAxisConfig = config.axes?.find(
      (axis: Record<string, unknown>) => axis['type'] === 'DOMAIN'
    );

    this.allowDecimals = xAxisConfig?.decimals !== undefined;
    this.labels = new ChartAxisLabel(xAxisConfig);
    this.title = new ChartAxisTitle(xAxisConfig);

    this.categories = this.#getCategories(config, analyticsMetaData);
  }

  static getAxes(
    config: any,
    analyticsMetaData: AnalyticsMetaData
  ): ChartXAxis[] {
    return [];
  }

  #getCategories(config: any, analyticsMetaData: AnalyticsMetaData) {
    return (config.xAxisType || []).map((dimension: string) => {
      const categories = analyticsMetaData[dimension] as string[];
      return (categories || []).map((category) => {
        return analyticsMetaData.getName(category);
      });
    });
  }
}
