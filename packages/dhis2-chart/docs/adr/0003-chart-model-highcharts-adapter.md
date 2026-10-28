# ADR 0003: Chart model and Highcharts serialization (Sprint 13)

Status: accepted for the current chart compatibility surface.

`buildStandardChartModel` validates legacy or normalized input and returns an
engine-neutral `ChartModel`. The model-only package entry, `@iapps/d2-charts/model`,
has no Highcharts runtime or browser dependency. Its readonly category, axis,
annotation, accessibility and discriminated series contracts contain no
Highcharts or DHIS2 adapter types. A distinct `YearOverYearChartModel` retains
the existing year-over-year route until its planned unification.

`HighchartsOptionsAdapter` owns both standard and year-over-year serialization.
The standard compatibility function, `buildStandardChartOptions`, delegates to
model creation and then this adapter. `D2Charts` and `D2Visualizer` retain
their public rendering and download behavior. The adapter emits explicit
series `type` discriminants; the pie drilldown parent gains `type: 'pie'`, which
matches the existing chart-level pie default but is a structural option change.

Model `requiredModules` lists exporting, offline exporting and export-data, plus
highcharts-more for radar/gauge, solid-gauge for gauges, and drilldown when
needed. The runtime adapter initializes requested modules once and reports the
name of a missing or failing module. Pure model creation never initializes an
engine. The package retains Highcharts `>=11.4.8 <12` as a peer.

Current presentation bags preserve legacy styling (including recorded defects)
through the model/adapter bridge. They are not yet a fully normalized styling
language. Future chart-definition work may narrow them without changing the
public model's analytics-free boundary. The year-over-year model is created in
its existing renderer; extracting its pure alignment pipeline belongs to
Sprint 16.
