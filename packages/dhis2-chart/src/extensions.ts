/** Stable extension entry point. Implementations remain package-private. */
export { ChartDefinitionRegistry, createStandardChartRegistry, defineChart } from './lib/chart-definitions';
export type { ChartBuildContext, ChartDefinition, ChartPolicy } from './lib/chart-definitions';
export { chartCapability, chartCapabilities } from './lib/chart-capabilities';
export type { ChartCapability, CapabilityStatus } from './lib/chart-capabilities';
export type { ChartModel, ChartSeriesModel, ChartModuleRequirement } from './lib/chart-model';
