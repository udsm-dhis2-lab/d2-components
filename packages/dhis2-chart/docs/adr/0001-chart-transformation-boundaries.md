# ADR 0001: Chart transformation boundaries and extension model

- Status: Accepted for staged implementation
- Date: 2026-10-28
- Scope: `@iapps/d2-charts` and chart delegation from `D2Visualizer`

## Context

The current standard chart path combines DHIS2 analytics interpretation,
calculation, presentation and Highcharts serialization in one procedural
helper. Year-over-year uses a separate data and rendering route. Adding DHIS2
capabilities or Highcharts series therefore requires modifying shared branches
with weak typing and broad regression risk.

The supplied technical guide proposes a normalized analytical model and a
capability-driven renderer. Those are design recommendations, not official
DHIS2 schemas. The supplied attribute catalogue is evidence for DHIS2 2.41 and
an inspected Data Visualizer version, but retained fields do not prove that all
type/attribute combinations are meaningful.

## Decision

Adopt this staged ownership pipeline:

```text
DHIS2/native or legacy input
  -> boundary validation and version-aware adapters
  -> normalized AnalyticalDataset
  -> pure layout/calculation/presentation transformations
  -> engine-neutral ChartModel
  -> registered chart definition
  -> HighchartsOptionsAdapter
  -> Highcharts instance lifecycle
```

### Boundaries

- Shared data-source/facade code owns HTTP, cancellation, caching and query
  refresh. Chart definitions never fetch data.
- Boundary adapters own native DHIS2 and legacy compatibility shapes.
- `AnalyticalDataset` owns dimension identity, coordinate identity and the
  distinction between absent, null and zero observations.
- Pure transformations own layout, sorting, cumulative values, stacking,
  year-over-year alignment, regression and outlier calculations.
- `ChartModel` describes chart meaning without importing Highcharts types.
- Chart definitions validate capabilities and assemble transformations.
- `HighchartsOptionsAdapter` alone serializes `ChartModel` into typed
  Highcharts options and declares optional module requirements.
- `D2Charts` owns target, active chart, download and disposal lifecycle and
  remains the direct compatibility facade.
- `D2Visualizer` owns visualization-family dispatch and continues delegating to
  `D2Charts` for chart requests.

### Class and composition policy

Use one abstract template class and shallow family abstractions for cartesian,
circular, polar and gauge charts. Leaf definitions may inherit from a family,
but cross-cutting behavior such as stacking, missing-value handling, line
style, regression and year-over-year alignment must be composable policies.
Avoid inheritance chains that duplicate configuration logic.

### Registry and extension policy

A typed registry maps discriminated chart types to definitions. Duplicate and
unknown registrations fail deterministically. External definitions can be
registered through a controlled public contract without accessing internal
Highcharts lifecycle state. Availability is capability-driven, including
required optional Highcharts modules.

### Compatibility policy

- Preserve `D2Charts`, the deprecated `ChartVisualizer` alias, fluent setters
  and `D2Visualizer` delegation during the staged migration.
- Characterization tests gate each migrated chart type.
- Defect fixes require explicit assertions and release notes; they are not
  hidden inside structural refactors.
- Unknown DHIS2 fields are retained at adapter boundaries where round-trip
  editing applies.
- Direct consumers may supply normalized data or legacy analytics/config; both
  converge before chart-definition execution.

### Highcharts policy

Highcharts `>=11.4.8 <12` is the Sprint 10 compatibility baseline. Optional
modules must be explicit and initialized once. No design may depend on a newer
major's API without a separate ADR and compatibility work. Plugin-shaped
nested categories are legacy behavior; their native replacement requires
visual, export and accessibility evidence before dependency removal.

## Consequences

The migration requires temporary legacy adapters and parallel tests. It adds a
neutral model but enables pure testing, independent direct use, explicit module
costs and per-type extension without expanding a central switch. Some existing
outputs identified as defects will remain until their owning sprint approves a
behavior change.

## Rejected alternatives

- Continue expanding `drawChart()` switches: low migration cost but preserves
  coupled responsibilities and regression risk.
- One deep subclass for every variant: moves conditionals into duplicated
  inheritance branches and makes mixed capabilities difficult.
- Expose raw `Highcharts.Options` as the domain model: prevents renderer-neutral
  validation and leaks engine/version details into DHIS2 processing.
- Fetch analytics in chart definitions: duplicates shared acquisition,
  cancellation and refresh behavior and harms direct normalized-data use.
