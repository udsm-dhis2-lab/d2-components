/** Model-only entry point: no Highcharts runtime or browser dependency. */
export { buildStandardChartModel } from './lib/standard-chart.model';
export type {
  ChartAccessibilityModel,
  ChartAnnotationModel,
  ChartAxisModel,
  ChartCategoryTuple,
  ChartModel,
  ChartOverlayModel,
  ChartModuleRequirement,
  ChartPointModel,
  ChartSeriesKind,
  ChartSeriesModel,
  ScatterChartPointModel,
  ChartTextModel,
  YearOverYearChartModel,
} from './lib/chart-model';
export { pairScatterMeasures, regressScatter, detectScatterOutliers, extremeScatterLines } from './lib/scatter-statistics';
export type { ScatterPoint, RegressionKind, RegressionResult, RegressionPoint, OutlierMethod, OutlierResult } from './lib/scatter-statistics';
