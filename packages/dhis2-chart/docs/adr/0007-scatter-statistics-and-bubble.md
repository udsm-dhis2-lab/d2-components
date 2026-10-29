# ADR 0007: Scatter pairing and statistical overlays

Status: implemented for Sprint 18; bubble deferred.

Scatter accepts two explicit `dx` measure IDs (`xMeasureId` and `yMeasureId`) or
one `series` assignment for each RANGE axis (axis 1 = horizontal, axis 0 =
vertical). Saved DHIS2 favorites with neither field are also accepted when
`columns` contains exactly one `dx` dimension with two items: the first item
is used for y and the second for x. This ordering is confirmed for the supplied
`EF4os1mklwE` favorite by its analytics ranges and expected chart, but is not
a general verified DHIS2 axis contract;
explicit assignments take precedence. For the compatibility facade, a saved
scatter favorite's `filters` are sent as analytics filters, so a relative
period such as `LAST_12_MONTHS` yields one aggregated value per measure and
organisation unit rather than twelve separate period coordinates. Direct
consumers should supply similarly aggregated data or one shared context.
The analytics boundary resolves headers by name. Pairing uses the
same organisation unit **and** all other dimension coordinates, drops incomplete
or null pairs, rejects duplicate numeric observations, and rejects multiple
complete contexts (DHIS2 scatter uses one period). The base series remains
untouched by statistical highlighting.

`regressScatter` exposes deterministic linear least-squares, degree-two
polynomial least-squares, and local-linear tricube LOESS (span 0.75 by default).
`detectScatterOutliers` scores vertical residuals against a fitted linear line
using IQR, population-standard-deviation z-score, or MAD-based modified z-score.
It uses linearly interpolated quartiles/median. Missing pairs are omitted;
insufficient samples, constant x, singular polynomial fits, invalid thresholds,
and invalid limits throw. Constant residuals produce no outliers; if IQR/MAD is
zero but a residual differs from the median, that residual receives an infinite
score. This is an explicit library convention, not a claim of numerical
equivalence with DHIS2's implementation.

Regression and flagged-point overlays are stored separately from the source
series in `ChartModel`. Extreme-line percentages become separate axis-line
overlays using empirical lower/upper quantiles of each axis. This quantile
interpretation is a library convention; the user-guide description does not
verify DHIS2's exact extreme-line formula. Highcharts serialization alone
turns the overlays into renderable options.
`scatterOutlierLimit` is a library-local cap (1–500); DHIS2's
`outlierAnalysis.maxResults` is reserved for `OUTLIER_TABLE` and rejected for
scatter. `OUTLIER_TABLE` remains in the table module.

The checked DHIS2 Data Visualizer guide documents scatter, its paired axes,
IQR/z-score/MAD methods, default factors and extreme lines. The checked
attribute catalogue says `BUBBLE` is backend-recognized but has no verified
app display entry, writable options contract or usable payload. Therefore no
bubble definition or payload adapter is shipped; consumers may register an
extension definition when they can verify their own contract. Bubble maps are
not bubble charts.

Sources: [DHIS2 Data Visualizer guide](https://docs.dhis2.org/en/use/user-guides/dhis-core-version-242/analysing-data/data-visualizer.html),
[DHIS2 2.36 release notes](https://github.com/dhis2/dhis2-releases/blob/master/releases/2.36/ReleaseNote-2.36.0.md),
`DHIS2_Visualization_Attribute_Catalogue.md` (local reference, section 4.6 and
type profiles).

Statistical limitation: methods identify candidates for review only. Small
samples, nonlinearity, tied values, temporal confounding, denominator effects
and non-independent observations can substantially change flags. LOESS is a
simple local-linear approximation, not a byte-for-byte DHIS2 curve. No
multiple-testing correction or confidence interval is provided.
