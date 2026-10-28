import { AnalyticalDataset } from './analytical-dataset';
import { buildStandardChartModel } from './standard-chart.model';
import { HighchartsOptionsAdapter } from './highcharts-options.adapter';

export { buildStandardChartModel } from './standard-chart.model';

/** Compatibility API: serialize the neutral model into Highcharts options. */
export function buildStandardChartOptions(
  analytics: unknown | AnalyticalDataset,
  configuration: unknown
): any {
  return new HighchartsOptionsAdapter().toOptions(
    buildStandardChartModel(analytics, configuration)
  );
}
