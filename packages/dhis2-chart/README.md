# `@iapps/d2-charts`

Standalone standard-chart and year-over-year-chart rendering for DHIS2
analytics. The module depends on Highcharts as a peer and does not load map,
table, custom-template or tracker engines.

Use `buildStandardChartOptions` and the year-over-year transformations without
a DOM. Use `D2Charts` or `YearOverYearLineHighchartsVisualizer` for DOM
rendering. Inject a `VisualizationDataSource` into `YearOverYearDataService` to
load year-over-year analytics without global HTTP state.

## Installation

`npm install @iapps/d2-charts highcharts`

## Usage

Use `D2Charts` or pure option transformations. See `examples/basic.mjs`.

## Lifecycle

Call `dispose()` before removing or replacing the host.

## Errors

Validate analytics headers and configuration before drawing. Data-source
failures reject asynchronously.

## Security

Do not enable HTML labels for untrusted values. No credentials are bundled.
