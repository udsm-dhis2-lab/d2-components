# ADR 0004: Shallow chart definitions and registry

Status: Accepted for Sprint 14.

The standard chart path now resolves a canonical type through `ChartDefinitionRegistry`. Each definition has one family (`cartesian`, `circular`, `polar`, `gauge`) and inherits a shared validation/policy/build lifecycle from `AbstractChartDefinition`. Leaf classes only declare their type and optional policies. Existing analytical transforms and `HighchartsOptionsAdapter` remain the calculation and serialization boundaries, respectively. Year-over-year is deliberately unchanged.

`D2Charts` accepts an optional registry as its second constructor argument; the first remains the Highcharts adapter. Direct `buildStandardChartModel` consumers may pass a registry as the third argument. Register external definitions on a newly created registry, rather than mutating the shared default. Registration requires an uppercase identifier; duplicate and unknown types throw deterministically. External definitions return an engine-neutral `ChartModel`; the facade retains timer, disposal and download ownership.

The existing raw `gauge` spelling is registered for direct callers even though it is not a public `ChartType` facade member. `SINGLE_VALUE` and `YEAR_OVER_YEAR_LINE` retain their separate facade paths and are not standard-chart registry entries. `combined` was previously a no-op branch and remains unsupported as a standard definition. The helper's legacy `drawChart` entry point remains for internal compatibility; new standard rendering supplies the family explicitly.

The policies currently preserve the old stacking, percent-stacking, dotted-line and pie-null choices. The old helper still owns option construction within each family. Moving more of that construction into policy-aware pure builders is a later migration, guarded by the Sprint 10 snapshots.
