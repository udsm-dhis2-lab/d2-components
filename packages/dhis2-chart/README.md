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
For two-category cartesian layouts, `ChartModel.categoryAxis.categoryTuples`
holds ordered `{leaf, parent}` values. The Highcharts adapter renders these
with two linked native axes; exported CSV categories retain both names. No
grouped-categories plugin is required. One-category layouts remain a single
string category axis.
`HighchartsOptionsAdapter` is the engine boundary. Its module availability
check reports the missing module names; `DefaultHighchartsAdapter` initializes
only required Highcharts modules, once per module.

For scatter, provide two explicit measures or a saved DHIS2 favorite with exactly
two ordered `dx` column items, and an analytics response with `dx`, `ou` and a
single shared period (which may be an aggregated filter absent from the rows).
The first column item maps to y and the second to x when no explicit mapping is
present. Pairing never joins different entities
or periods. Statistical overlays are optional and are review aids, not
diagnoses:

```ts
const model = buildStandardChartModel(analytics, {
  type: 'SCATTER',
  renderId: 'chart',
  xMeasureId: 'staffing',
  yMeasureId: 'coverage',
  regressionType: 'LINEAR',
  outlierAnalysis: {
    enabled: true,
    outlierMethod: 'IQR',
    thresholdFactor: 1.5,
  },
});
const options = new HighchartsOptionsAdapter().toOptions(model);
```

`POLYNOMIAL` (quadratic) and `LOESS` are also available as library regression
strategies. `scatterOutlierLimit` is a library-only overlay cap; DHIS2's
`outlierAnalysis.maxResults` belongs to `OUTLIER_TABLE`, not scatter. Bubble
chart support is deferred pending a verified writable DHIS2 contract. The
repository's ADR 0007 records the statistical conventions and limitations.

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

# Chart definition extensions

`D2Charts` accepts an optional `ChartDefinitionRegistry` as its second constructor argument. Create an isolated registry with `createStandardChartRegistry()`, register an uppercase custom `ChartDefinition`, then pass it to `new D2Charts(highchartsAdapter, registry)`. A definition receives a validated legacy configuration and analytics and must return a `ChartModel`; Highcharts serialization remains owned by the package. Existing fluent setters and the first constructor argument are unchanged. Duplicate or unknown types throw an explicit error.

The supported-option matrix is available through `chartCapabilities`, `chartCapability(type, key)` and `registry.capabilities(type)`. Unsupported option/type combinations throw `AnalyticalBoundaryError` with paths. `topLimit` is not a verified chart option and is rejected when nonzero.

Run `npx nx run dhis2-chart:visual-smoke` for a real Highcharts/Chromium SVG and ARIA smoke check. The test environment needs a Playwright Chromium installation (`npx playwright install chromium`).
Run `npx nx run dhis2-chart:category-dependency-check` to guard manifests and
built artifacts against reintroducing the removed plugin.
