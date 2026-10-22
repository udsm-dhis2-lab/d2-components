import { drawChart } from './chart/helpers/draw-chart.helper';

/** Pure analytics/configuration to Highcharts-options transformation. */
export function buildStandardChartOptions(
  analytics: any,
  configuration: any
): any {
  return drawChart(analytics, configuration);
}
