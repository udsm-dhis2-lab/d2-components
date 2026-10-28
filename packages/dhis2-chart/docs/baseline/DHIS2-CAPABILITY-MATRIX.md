# DHIS2 chart capability baseline

## Purpose and evidence rules

This matrix is a Sprint 10 inventory, not a promise that every retained DHIS2
field is meaningful in every chart. It uses:

- **Verified DHIS2**: described by the supplied DHIS2 2.41/API and inspected
  Data Visualizer catalogue.
- **Current library**: observed in `@iapps/d2-charts` source and tests.
- **Proposed**: architecture proposed by the supplied technical guide; it is
  not a native DHIS2 contract.

Reference documents: [DHIS2 Visualization Technical Guide](/home/rajabu-mkomwa/Downloads/DHIS2_Visualization_Technical_Guide.md)
and [DHIS2 Visualization Attribute Catalogue](/home/rajabu-mkomwa/Downloads/DHIS2_Visualization_Attribute_Catalogue.md).

Status meanings are `supported`, `partial`, `deferred`, `rejected` and
`unverified`. Partial means the public input is accepted but at least one
documented semantic is absent or inconsistent.

## Visualization types

| DHIS2 type | DHIS2 evidence | Current path | Status | Notes |
| --- | --- | --- | --- | --- |
| COLUMN | Verified DHIS2 | `column` | supported | Series/categories, sorting, axes and labels are present. |
| STACKED_COLUMN | Verified DHIS2 | `stacked_column` | supported | Normal and percent stacking are characterized. |
| BAR | Verified DHIS2 | `bar` | supported | Implemented through the standard cartesian branch. |
| STACKED_BAR | Verified DHIS2 | `stacked_bar` | supported | Normal and percent stacking are characterized. |
| LINE | Verified DHIS2 | `line` | supported | Mixed-series mapping is partial; see attributes. |
| AREA | Verified DHIS2 | `area` | partial | Current implementation always applies normal stacking. |
| STACKED_AREA | Verified DHIS2 | none | deferred | Not a current public `ChartType`. |
| PIE | Verified DHIS2 | `pie` | partial | Multi-item drilldown exists; nulls are converted to zero. |
| RADAR | Verified DHIS2 | `radar` | supported | Highcharts polar line representation. |
| GAUGE | Verified DHIS2 | internal `gauge` alias | partial | Not in public `ChartType`; output mixes gauge and solid-gauge settings. |
| YEAR_OVER_YEAR_LINE | Verified DHIS2 | dedicated YOY renderer | partial | Separate renderer/data path, not standard chart context. |
| YEAR_OVER_YEAR_COLUMN | Verified DHIS2 | none | deferred | No current renderer. |
| SINGLE_VALUE | Verified DHIS2 | KPI module/facade | rejected | Valid visualization, but not a Highcharts chart definition. |
| PIVOT_TABLE | Verified DHIS2 | pivot module/facade | rejected | Valid visualization, but not a chart definition. |
| SCATTER | Verified DHIS2 | none | deferred | Requires paired-measure transformation. |
| OUTLIER_TABLE | Verified DHIS2 | none in chart package | rejected | Belongs to the table/pivot module. |
| BUBBLE | Backend enum only | none | unverified | Writable app/API contract must be verified before support. |
| DOTTED | Library compatibility type | `dotted` | supported | Not a DHIS2 visualization type; represented as a zero-width line. |
| SOLIDGAUGE | Library compatibility type | `solidgauge` | supported | Requires Highcharts More and solid-gauge modules. |

## Selection, layout and analysis attributes

| Attribute/group | Evidence | Status | Current behavior or boundary |
| --- | --- | --- | --- |
| `columns`, `rows`, `filters` | Verified DHIS2 | partial | Adapted into `xAxisType`/`yAxisType`; validation is weak. |
| `dataDimensionItems` | Verified DHIS2 | partial | Resolved analytics metadata is consumed; full write model is outside renderer. |
| Dynamic dimension records | Verified DHIS2 | partial | Analytics output can be rendered when metadata supplies dimension arrays. |
| `relativePeriods` | Verified DHIS2 | rejected | Query/data-source responsibility, not rendering. |
| `yearlySeries` | Verified DHIS2 | partial | Dedicated YOY service supports years, not the full native option contract. |
| `aggregationType` | Verified DHIS2 | rejected | Analytics query/server concern. |
| `completedOnly` | Verified DHIS2 | rejected | Analytics query concern. |
| `cumulativeValues` | Verified DHIS2 | partial | Implemented procedurally; ordering and missing-value semantics need formalization. |
| `sortOrder` | Verified DHIS2 | supported | Ascending/descending/none are characterized. |
| `sorting[]` | Verified DHIS2 | deferred | Structured dimension sorting is not implemented. |
| `topLimit` | Verified for pivot | rejected | Not a verified chart option in the supplied type profiles. |
| `hideEmptyRowItems` | Verified DHIS2 | deferred | Strategy enum is not implemented by standard chart transformation. |
| `measureCriteria` | Verified DHIS2 | unverified | Retained by app profiles; renderer semantics are not established. |
| `regressionType` | Verified DHIS2 | deferred | NONE/LINEAR/POLYNOMIAL/LOESS not implemented. |
| `outlierAnalysis` | Verified DHIS2 | deferred | Scatter/outlier algorithms are not implemented. |
| `skipRounding` | Verified DHIS2 | partial | Decimal handling exists on axes, not as a coherent value policy. |

## Presentation attributes

| Attribute/group | Evidence | Status | Current behavior or boundary |
| --- | --- | --- | --- |
| `axes[]` DOMAIN/RANGE | Verified DHIS2 | partial | Titles, styles and decimals map; steps/index/axis bounds are incomplete. |
| Axis `minValue`/`maxValue` | Verified DHIS2 | partial | Current helper primarily reads legacy range-axis fields. |
| Axis target/base lines | Verified DHIS2 | partial | Current helper reads legacy scalar fields rather than modern nested axes. |
| Axis label/title `fontStyle` | Verified DHIS2 | partial | Color, size, bold, italic and alignment are inconsistently mapped. |
| Per-item `series[]` | Verified DHIS2 | partial | Type/color supported through `seriesOptions`; axis uses misspelled `axix`. |
| Mixed COLUMN/LINE | Verified DHIS2 | partial | Series type works; correct DHIS2 `axis` field is ignored. |
| `percentStackedValues` | Verified DHIS2 | supported | Characterized for stacked column/bar. |
| `noSpaceBetweenColumns` | Verified DHIS2 | supported | Maps to group padding. |
| `showData` | Verified DHIS2 | supported | Maps to point data labels. |
| `seriesKey` | Verified DHIS2 | deferred | No dedicated mapping. |
| `legend` | Verified DHIS2 | partial | Hide/show works; range legend semantics do not. |
| `hideLegend` | Current compatibility | supported | Applied by plot options. |
| `title`, `hideTitle` | Verified DHIS2 | partial | Title model exists; native styled-object coverage is incomplete. |
| `subtitle`, `hideSubtitle` | Verified DHIS2 | deferred | Current standard options emit an empty subtitle. |
| `fontStyle` | Verified DHIS2 | partial | Only selected axis properties are mapped. |
| `colorSet` | Verified DHIS2 | partial | Fixed fallback palette and per-series colors exist; native set resolution does not. |
| `digitGroupSeparator` | Verified for KPI/table | rejected | Not a verified standard-chart attribute. |
| `icons[]` | Verified for single value | rejected | Single-value module responsibility. |

## Renderer and interaction capabilities

| Capability | Evidence | Status | Notes |
| --- | --- | --- | --- |
| Multiple category dimensions | Verified DHIS2 | partial | Builds plugin-shaped groups internally, then sanitizes them to parent-name strings and loses inner labels. |
| Multiple range axes | Verified DHIS2 | partial | Axes render; per-series assignment has the `axix` defect. |
| Pie drilldown | Highcharts/current library | supported | Uses the Highcharts drilldown module. |
| PNG export | Current library | supported | Delegates to offline exporting. |
| CSV export | Current library | supported | Uses export-data plus browser download APIs. |
| XLS export | Public compatibility enum | deferred | Accepted but silently does nothing. |
| Resize | Highcharts implicit behavior | unverified | Adapter exposes no explicit reflow contract. |
| Accessibility module | Highcharts capability | deferred | Not initialized by the current adapter. |
| Responsive options | Highcharts capability | deferred | No library-level mapping. |
| Annotations | Highcharts capability | deferred | No neutral or public contract. |
| External definition registry | Proposed | deferred | Planned architecture, not current behavior. |

## Highcharts 11 module baseline

The package peer range is constrained to `highcharts >=11.4.8 <12`. Current adapter
initialization is one-time and eagerly loads:

- exporting;
- offline-exporting;
- export-data;
- highcharts-more;
- solid-gauge; and
- drilldown.

The accessibility, annotations, boost, no-data and data modules are not loaded.
Future work must validate APIs against Highcharts 11 documentation or approve a
separate version upgrade; live documentation for later majors is not sufficient
evidence for this baseline.
