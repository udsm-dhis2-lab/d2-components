/** Public runtime and compatibility entry point. Prefer /model for pure work. */
export { D2Charts, ChartVisualizer } from './lib/chart/chart-visualizer';
export { buildStandardChartOptions, buildStandardChartModel } from './lib/standard-chart.transform';
export { ChartDefinitionRegistry, createStandardChartRegistry, defineChart,
  AbstractChartDefinition, CartesianChartDefinition, CircularChartDefinition,
  PolarChartDefinition, GaugeChartDefinition, ConfigurationPolicy,
  ColumnDefinition, BarDefinition, LineDefinition, DottedDefinition,
  StackedColumnDefinition, StackedBarDefinition, AreaDefinition,
  StackedAreaDefinition, PieDefinition, RadarDefinition, SolidGaugeDefinition,
  ScatterDefinition, LegacyGaugeDefinition, standardChartRegistry,
  stackingPolicy, percentStackingPolicy, lineStylePolicy, missingValuePolicy,
} from './lib/chart-definitions';
export type { ChartDefinition, ChartBuildContext, ChartPolicy, StandardChartType } from './lib/chart-definitions';
export { chartCapability, chartCapabilities } from './lib/chart-capabilities';
export type { ChartCapability, CapabilityStatus } from './lib/chart-capabilities';
export { HighchartsOptionsAdapter } from './lib/highcharts-options.adapter';
export { DefaultHighchartsAdapter, initializeHighcharts } from './lib/highcharts-adapter';
export type { HighchartsAdapter, ChartInstance } from './lib/highcharts-adapter';
export type { ChartModel, ChartSeriesModel, ChartSeriesKind, ChartPointModel,
  ScatterChartPointModel, ChartAxisModel, ChartCategoryTuple, ChartTextModel,
  ChartAccessibilityModel, ChartAnnotationModel, ChartOverlayModel,
  ChartModuleRequirement, YearOverYearChartModel,
} from './lib/chart-model';
export { pairScatterMeasures, regressScatter, detectScatterOutliers, extremeScatterLines } from './lib/scatter-statistics';
export type { ScatterPoint, RegressionKind, RegressionResult, RegressionPoint, OutlierMethod, OutlierResult } from './lib/scatter-statistics';
export {
  AnalyticalBoundaryError,
  assertAnalyticalDataset,
  isAnalyticalDataset,
} from './lib/analytical-dataset';
export type {
  AnalyticalDataset,
  AnalyticalDimension,
  AnalyticalHeader,
  AnalyticalItem,
  AnalyticalMetadata,
  AnalyticalObservation,
  AnalyticalValue,
  BoundaryIssue,
} from './lib/analytical-dataset';
export {
  normalizeAnalyticalData,
  toLegacyAnalytics,
} from './lib/analytics-boundary';
export { adaptLegacyChartConfiguration } from './lib/legacy-chart-configuration';
export type { LegacyChartConfiguration } from './lib/legacy-chart-configuration';
export { YearOverYearDataService, buildYearOverYearSeries } from './lib/year-over-year-data.service';
export type { YearOverYearRequest, YearOverYearBundle } from './lib/year-over-year-data.service';
export { parseYearPeriod, alignYearOverYear } from './lib/year-over-year.alignment';
export type { YearOverYearPeriodType, Week53Policy, YearPeriod, YearValues, AlignedYearOverYear } from './lib/year-over-year.alignment';
export { buildYearOverYearChartModel } from './lib/year-over-year.model';
export { YearOverYearLineHighchartsVisualizer } from './lib/year-over-year-line';
export { BaseVisualizer, downloadCsv } from './lib/core';
export type { DownloadFormat, ChartType, AnalyticsResponse, AnalyticsQuery, VisualizationDataSource, Visualizer } from './lib/core';
