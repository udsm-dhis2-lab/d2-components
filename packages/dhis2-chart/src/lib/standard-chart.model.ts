import { drawChart } from './chart/helpers/draw-chart.helper';
import {
  AnalyticalDataset,
  assertAnalyticalDataset,
  isAnalyticalDataset,
} from './analytical-dataset';
import {
  normalizeAnalyticalData,
  toLegacyAnalytics,
} from './analytics-boundary';
import { adaptLegacyChartConfiguration } from './legacy-chart-configuration';
import { ChartModel } from './chart-model';

/** Pure analytics/configuration to engine-neutral chart meaning. */
export function buildStandardChartModel(
  analytics: unknown | AnalyticalDataset,
  configuration: unknown
): ChartModel {
  adaptLegacyChartConfiguration(configuration);
  if (isAnalyticalDataset(analytics)) {
    assertAnalyticalDataset(analytics);
    const legacy = toLegacyAnalytics(analytics);
    normalizeAnalyticalData(legacy);
    return drawChart(legacy, configuration);
  }
  normalizeAnalyticalData(analytics);
  return drawChart(analytics, configuration);
}
