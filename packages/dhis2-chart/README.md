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

Use `D2Charts` or pure option transformations. Runnable examples are in
`examples/basic.mjs`, `examples/normalized.mjs` and `examples/extension.mjs`.

```ts
import { buildStandardChartModel } from '@iapps/d2-charts/model';
import { HighchartsOptionsAdapter } from '@iapps/d2-charts';

const model = buildStandardChartModel(analytics, configuration);
const options = new HighchartsOptionsAdapter().toOptions(model);
```

A direct DOM consumer supplies a host, configuration and either raw analytics
or a normalized `AnalyticalDataset`:

```ts
import { D2Charts, normalizeAnalyticalData } from '@iapps/d2-charts';

const dataset = normalizeAnalyticalData(analyticsResponse);
const chart = new D2Charts()
  .setId('chart-host')
  .setType('COLUMN')
  .setConfig({ type: 'COLUMN', renderId: 'chart-host', xAxisType: ['pe'], yAxisType: 'dx', zAxisType: [] })
  .setAnalyticalDataset(dataset);
chart.draw();
// When the host is removed:
chart.dispose();
```

The `@iapps/d2-charts/model` entry is DOM-free and does not import Highcharts.
`@iapps/d2-charts/extensions` is the supported extension contract. Package
subpaths other than `.`, `/model`, and `/extensions` are not public.

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

```ts
import { D2Charts, buildStandardChartModel } from '@iapps/d2-charts';
import { createStandardChartRegistry, defineChart } from '@iapps/d2-charts/extensions';

const registry = createStandardChartRegistry(); // never mutate the shared default
registry.register(defineChart({
  type: 'LOCAL_COLUMN',
  family: 'cartesian',
  build: ({ analytics }) => ({
    ...buildStandardChartModel(analytics, {
      type: 'COLUMN', xAxisType: ['pe'], yAxisType: 'dx', zAxisType: [],
    }),
    visualType: 'local-column',
  }),
}));
const chart = new D2Charts(undefined, registry);
chart.setId('chart-host').setConfig({ type: 'LOCAL_COLUMN' }).setData(analyticsResponse);
chart.setType('LOCAL_COLUMN').draw();
```

Definitions must use uppercase unique identifiers, declare one supported
family and return an engine-neutral `ChartModel`. Do not mutate input analytics,
global registries or the returned model. The package retains Highcharts module,
download and disposal ownership. External definitions are consumer-owned:
DHIS2 payload compatibility, accessibility and any optional-module costs must
be reviewed before use. No new built-in series types are approved for this
sprint; BUBBLE still lacks a verified writable chart contract.

Run `npm exec nx run dhis2-chart:bundle-budget` to enforce model/runtime and
per-optional-module budgets, including a check that root imports do not execute
optional Highcharts modules. The pure `/model` and `/extensions` entries remain
Highcharts-free. The root browser bundle can still include optional-module code
when bundled without externalizing Highcharts; see the Sprint 19 release review.

Run `npx nx run dhis2-chart:visual-smoke` for a real Highcharts/Chromium SVG and ARIA smoke check. The test environment needs a Playwright Chromium installation (`npx playwright install chromium`).
Run `npx nx run dhis2-chart:category-dependency-check` to guard manifests and
built artifacts against reintroducing the removed plugin.

## Multi-axis COLUMN visualizations

Saved DHIS2 `COLUMN` configurations may assign each `dx` item a numeric
`series[].axis` even when `axes` is empty. `D2Charts` now creates positional
range axes through the highest referenced index (including empty intermediate
slots), preserves `COLUMN`/`LINE` series types, and leaves the category axis
separate. Axis 0 is left, axis 1 right, and later inferred axes alternate sides
with an outward offset. Explicit `RANGE` axes remain authoritative. No units
or axis titles are inferred from indicator names or data types. This placement
is a deterministic library rule; visual parity with DHIS2's rendering of the
two supplied favorites has not yet been independently verified.

Use the existing `D2Charts` renderer or `D2Visualizer` facade and provide
analytics with `dx` and `pe` headers plus the referenced metadata IDs. The
facade retains card-owned title, download and fullscreen controls. Invalid or
duplicate series assignments fail with a field path. Multi-axis support is
currently verified for `COLUMN` with optional `LINE` items; other families
require separate contracts and tests.
