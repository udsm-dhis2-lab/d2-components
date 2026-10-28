# ADR 0005: Unified year-over-year alignment

YOY acquisition remains in `YearOverYearDataService` through the shared
`VisualizationDataSource`. Its existing `LAST_5_YEARS;THIS_YEAR` and
`LAST_52_WEEKS` query plan is unchanged. Chart definitions never fetch data.

`alignYearOverYear` is an immutable, DOM-free transformation supporting DHIS2
weekly (`YYYYWn`), monthly (`YYYYMM`) and quarterly (`YYYYQn`) identifiers.
The facade currently acquires weekly data only. Unsupported or mixed period
identifiers fail clearly. The latest successful year's metadata defines the
axis and preserves its order. Week 53 is included when present on that axis
unless explicitly omitted; an older-only week 53 is not appended. Missing
periods and empty values are null, observed zero stays zero, and incomplete
years retain null gaps. Partially failed years are omitted with warnings.

Alignment precedes sorting and presentation. Year-series sorting operates on
the complete aligned matrix. YOY does not currently run cumulative arithmetic
or empty-item filtering; adding either requires an explicit post-alignment
null policy. General analytics queries and category rendering are unchanged.

`D2Charts` delegates YOY line and column to standard `LINE`/`COLUMN` chart
definitions and the standard Highcharts options adapter. `D2Visualizer` uses
the same renderer. In-flight YOY acquisition receives an abort signal; draw
generation checks also reject stale results. The old
`YearOverYearLineHighchartsVisualizer` import is deprecated but remains as a
thin compatibility wrapper. Its separate renderer implementation is retired.
The old YOY model and serializer remain declaration-compatible but are no
longer called by the production path.

Proposed intentional deviation from the Sprint 10 baseline: a missing weekly
value is no longer fabricated as zero. Standard-adapter presentation differs
from the previous bespoke YOY styles and tooltip. Functional SVG and ARIA
browser smoke passes, but pixel-level visual parity is not established; obtain
product approval of both deviations before release.
