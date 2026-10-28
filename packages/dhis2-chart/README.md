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

For direct use with already fetched data, call `normalizeAnalyticalData(raw)`
and pass the resulting `AnalyticalDataset` to
`new D2Charts().setAnalyticalDataset(dataset)`. This path performs no HTTP
request. `buildStandardChartOptions(dataset, configuration)` accepts the same
normalized input without a DOM. The runtime boundary reports invalid values as
`AnalyticalBoundaryError` with `issues` containing paths and codes.

The normalized model distinguishes a missing observation (no coordinate row),
an explicit null observation, and numeric zero. The existing Highcharts helper
still has its historical missing-value rendering behavior; later chart-model
work will use the normalized distinction end to end. Unknown DHIS2 response,
metadata, item and configuration properties are retained by the adapters.

## Lifecycle

Call `dispose()` before removing or replacing the host.

## Errors

Chart drawing validates analytics headers, row values and required layout
configuration before calling the current Highcharts option builder. Data-source
failures reject asynchronously.

## Security

Do not enable HTML labels for untrusted values. No credentials are bundled.
