# ADR 0002: Pure chart transformation order (Sprint 12)

Status: accepted for the compatibility refactor; not a new chart contract.

`drawChart()` remains the private compatibility orchestrator. Its order is:

1. Apply cumulative row transformation only when `cumulativeValues` is set.
   The historical reverse-period traversal and integer accumulation are kept.
2. Resolve ordered axis items, build the series matrix, and sort by the sum of
   category values. Ordinary series then receive mixed-type/axis/color options.
3. Build branch-specific chart options (ordinary, radar, pie, solid gauge),
   including presentation options and category labels.
4. Filter points with nonnumeric values or unmatched selection-group members,
   recolor matching groups, then flatten x-axis categories as before.

The transformations in `src/lib/chart/transforms/` accept data/configuration,
create new arrays/objects, and do not initialize Highcharts or touch the DOM.
The serialized Sprint 10-compatible option snapshots guard this ordering. They
are not approvals of the defects in `CURRENT-BEHAVIOR-AND-DEFECTS.md`.

`limitCategories()` is available as a pure calculation but is intentionally not
wired into `drawChart()`: no verified legacy top-limit behavior exists to
preserve. `buildLegendOptions()` is likewise extracted but the legacy legend
property remains disabled in the orchestrator. Enabling either is a separate
behavior change.

Invalid/unsupported combinations are intentionally unchanged: `combined`
still has no generated series; cumulative mode assumes one x-axis dimension
and numeric, parseable values; sorting assumes matching point ids; the current
category shaping loses deeper grouping; and malformed metadata can still fail
before chart construction. Boundary validation from Sprint 11 remains the
entry-point guard. Do not treat these cases as supported chart semantics.

Remaining `draw-chart.helper.ts` responsibilities: chart-type dispatch,
pie drilldown parent totals, radar/gauge pane selection, Highcharts chart,
plot, x/y-axis and export option assembly, and final orchestration. Legacy
models remain in place for compatibility; removal requires separate proof.
