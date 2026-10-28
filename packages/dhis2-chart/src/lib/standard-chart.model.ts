import { ChartDefinitionRegistry, standardChartRegistry } from './chart-definitions';
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
  configuration: unknown,
  registry: ChartDefinitionRegistry = standardChartRegistry
): ChartModel {
  const chartConfiguration = adaptLegacyChartConfiguration(configuration);
  if (isAnalyticalDataset(analytics)) {
    assertAnalyticalDataset(analytics);
    const legacy = toLegacyAnalytics(analytics);
    normalizeAnalyticalData(legacy);
    return registry.resolve(chartConfiguration.type).build({ analytics: legacy, configuration: chartConfiguration, source: configuration });
  }
  normalizeAnalyticalData(analytics);
  return registry.resolve(chartConfiguration.type).build({ analytics, configuration: chartConfiguration, source: configuration });
}
