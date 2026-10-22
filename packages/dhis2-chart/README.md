# `@iapps/d2-charts`

Standalone standard-chart and year-over-year-chart rendering for DHIS2
analytics. The module depends on Highcharts as a peer and does not load map,
table, custom-template or tracker engines.

Use `buildStandardChartOptions` and the year-over-year transformations without
a DOM. Use `D2Charts` or `YearOverYearLineHighchartsVisualizer` for DOM
rendering. Inject a `VisualizationDataSource` into `YearOverYearDataService` to
load year-over-year analytics without global HTTP state.
