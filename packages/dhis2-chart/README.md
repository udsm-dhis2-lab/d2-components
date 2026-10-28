# `@iapps/d2-charts`

Standalone standard-chart and year-over-year-chart rendering for DHIS2
analytics. The module depends on Highcharts as a peer and does not load map,
table, custom-template or tracker engines.

Use `buildStandardChartModel` from `@iapps/d2-charts/model` without a DOM or
Highcharts runtime. Use `buildStandardChartOptions` when Highcharts options are
needed, and `D2Charts` or `YearOverYearLineHighchartsVisualizer` for DOM
rendering. Inject a `VisualizationDataSource` into `YearOverYearDataService` to
load year-over-year analytics without global HTTP state.

## Installation

`npm install @iapps/d2-charts highcharts`

## Usage

Use `D2Charts` or pure option transformations. See `examples/basic.mjs`.

```ts
import { buildStandardChartModel } from '@iapps/d2-charts/model';
import { HighchartsOptionsAdapter } from '@iapps/d2-charts';

const model = buildStandardChartModel(analytics, configuration);
const options = new HighchartsOptionsAdapter().toOptions(model);
```

`ChartModel` has discriminated series and explicit `requiredModules`.
`HighchartsOptionsAdapter` is the engine boundary. Its module availability
check reports the missing module names; `DefaultHighchartsAdapter` initializes
only required Highcharts modules, once per module.

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
configuration before building a model and serializing it. Data-source
failures reject asynchronously.

## Security

Do not enable HTML labels for untrusted values. No credentials are bundled.
