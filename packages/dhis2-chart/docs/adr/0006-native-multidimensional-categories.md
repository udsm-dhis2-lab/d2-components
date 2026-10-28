# ADR 0006: Native multidimensional category axes

Status: selected for Sprint 17 against Highcharts 11.4.8.

The chart model carries an ordered `ChartCategoryTuple[]` of `{leaf, parent?}`
values. One-dimensional charts still serialize to one string category axis and
retain their Sprint 12 option snapshots. Two-dimensional cartesian charts use
documented Highcharts primitives: the primary category axis holds full
`parent — leaf` values (for CSV, SVG metadata and screen readers), while its
tick formatter displays the leaf. A linked secondary x-axis uses native
`linkedTo`, `opposite` and `tickPositions` to display a parent label at the
center of each contiguous run. Inverted bars naturally place this axis on the
opposite side. Parent runs are recomputed after sorting and empty filtering;
repeated parents separated by another parent remain separate runs. No nested
object is supplied to `xAxis.categories`.

The first configured category dimension is the outer parent and the second is
the repeated leaf (for `['pe', 'ou']`, periods appear above organisation units).
Both linked axes suppress tick marks so labels do not acquire pointer lines.
Native plot lines mark only the boundaries between contiguous parent runs;
they follow the category axis in normal and inverted charts and survive export.
Category labels use 11px text in `#404b5a`. Parent labels remain horizontal and have a
bounded width so long text wraps rather than rotating; leaf labels inherit the
same font size. Single-category labels also use 11px.

The alternative native plot-band prototype displayed labels in normal and
inverted SVG and survived resize, but places parent labels inside the plot
area, where they compete with data marks and can require bespoke positioning.
The linked-axis prototype also passed both orientations and resize, and keeps
the hierarchy in the axis margins. The selected implementation additionally
passes real-browser screen, resize, accessibility-name, SVG, CSV and local PNG
checks for column and bar charts, including missing combinations, translated
and long labels. The prototypes and assertions live in the Nx
`category-prototypes` and `visual-smoke` targets.

Highcharts references:

- [Category and multiple axes](https://www.highcharts.com/docs/chart-concepts/axes)
- [Linked x-axis](https://api.highcharts.com/highcharts/xAxis.linkedTo)
- [Explicit tick positions](https://api.highcharts.com/highcharts/xAxis.tickPositions)
- [Axis label formatter](https://api.highcharts.com/highcharts/xAxis.labels.formatter)
- [Plot-band labels](https://api.highcharts.com/highcharts/xAxis.plotBands.label)
- [Exporting API](https://api.highcharts.com/class-reference/Highcharts.Exporting)

The root plugin dependency, ambient declaration and lockfile entry are
removed. `category-dependency-check` guards the manifest, declaration and
built artifacts against reintroduction. This does not upgrade Highcharts.

Residual risk: automated image presence and label checks do not substitute
for product approval of spacing and typography across supported dashboards.
Highcharts may drop tick labels at extreme density; long-label visual review
and keyboard testing with a screen reader remain release gates.
