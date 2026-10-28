import { drawChart } from './chart/helpers/draw-chart.helper';
import { AnalyticalDataset, assertAnalyticalDataset, isAnalyticalDataset } from './analytical-dataset';
import { normalizeAnalyticalData, toLegacyAnalytics } from './analytics-boundary';
import { adaptLegacyChartConfiguration } from './legacy-chart-configuration';

/** Pure analytics/configuration to Highcharts-options transformation. */
export function buildStandardChartOptions(
  analytics: unknown | AnalyticalDataset,
  configuration: unknown
): any {
  adaptLegacyChartConfiguration(configuration);
  if (isAnalyticalDataset(analytics)) {
    assertAnalyticalDataset(analytics);
    const legacy = toLegacyAnalytics(analytics);
    normalizeAnalyticalData(legacy);
    return drawChart(legacy, configuration);
  }
  normalizeAnalyticalData(analytics);
  // The raw input is retained here to keep Sprint 10 option output unchanged.
  return drawChart(analytics, configuration);
}
