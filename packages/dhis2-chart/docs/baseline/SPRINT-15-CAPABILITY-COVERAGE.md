# Sprint 15 chart capability coverage

The executable, machine-readable matrix is exported as `chartCapabilities` from
`@iapps/d2-charts`. UI consumers can call `chartCapability(type, key)` or
`createStandardChartRegistry().capabilities(type)` to query supported keys.
The registry validates implemented options at the rendering boundary and
reports `AnalyticalBoundaryError` issues with configuration paths.

| Capability | Status | Evidence/limits |
| --- | --- | --- |
| DOMAIN/RANGE axes, bounds, decimals, steps, reference lines | supported | Verified aggregate `axes[]`; range `steps` maps to `tickAmount = steps + 1`, domain `steps` to `tickInterval`. |
| Per-item series type and axis | partial | Same-family types and verified COLUMN/LINE mixes; unverified pairings reject. Range-axis IDs are translated to Highcharts positions. |
| Stacked area, normal/percent stacking | supported | `STACKED_AREA` added; existing AREA remains normally stacked for compatibility. |
| Column spacing, data labels | supported | Existing mappings remain. |
| Title/subtitle, nested axis/key font style, series key | partial | Modern title is used when explicitly present in nested `config` or direct configuration. Only mapped font properties are supported; range legend sets are not. |
| Colour set | partial | Installed default key only; unknown keys reject, no invented palette mapping. |
| Legacy `sortOrder`, category `sorting[]` | partial | Structured sorting is limited to ASC/DESC of the configured category dimension; other rules reject. |
| Cumulative values | partial | Decimal accumulation and legacy array-series-dimension input supported; ratio aggregation and missing-value semantics remain under review. |
| Empty-item strategies | partial | NONE/BEFORE_FIRST/AFTER_LAST/BOTH/ALL supported using observed category row presence; multi-dimensional missingness needs further verification. |
| `topLimit` | rejected | Verified for table/report workflows, not chart profiles; nonzero values reject explicitly. |
| Value-range legend, scatter, bubble, outliers, YOY | deferred | Not implemented or not verified for this sprint. |

The historical Sprint 10 matrix remains a record of the earlier baseline.
Structural option tests cover mixed axes, stacking and accessible text labels.
The `dhis2-chart:visual-smoke` Nx target renders mixed and stacked-area charts
with real Highcharts in Chromium, checks SVG/series output, captures in-memory
screenshots and verifies ARIA labels with the Highcharts accessibility module
loaded by the smoke harness. It is not a pixel-diff test or a full WCAG audit;
the production adapter does not yet initialize that optional module.
