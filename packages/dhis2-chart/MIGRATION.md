# Chart extension migration and support

No chart type or deprecated fluent API is removed in this release. `D2Charts`,
`ChartVisualizer`, `YearOverYearLineHighchartsVisualizer`, and the existing
facade delegation remain available. Highcharts remains a peer dependency in
the supported 11.x range (`>=11.4.8 <12`).

Use `@iapps/d2-charts/model` for DOM-free analytics transformations, and
`@iapps/d2-charts/extensions` for `ChartDefinitionRegistry`, `defineChart`,
`ChartDefinition`, `ChartBuildContext`, and capability discovery. Construct a
fresh registry with `createStandardChartRegistry()` for each extension owner;
never mutate `standardChartRegistry`. Pass the registry as the second
`D2Charts` constructor argument. A custom definition owns its type-specific
analytics contract and accessibility evidence, but the chart package still
owns Highcharts serialization, lifecycle and downloads.

The root entry explicitly retains documented runtime and compatibility
symbols. Internal helpers `buildScatterChartModel`,
`validateChartCapabilities`, `requiredChartModules`, and
`requiredModulesForOptions` are no longer root exports; use
`buildStandardChartModel` and `chartCapability` for the first two cases.
Highcharts module selection remains adapter-owned. Deep package
imports remain blocked by the export map. If an application imported an
internal source path through a bundler alias, move to the documented entry
points before upgrading.

No additional Highcharts chart family, theme override API, or bubble payload
is published without an approved data, accessibility and module-cost
contract. The current `ChartModel` palette and presentation fields are the
engine-neutral extension surface; a general theme API remains deferred.

For facade consumers, continue using `D2Visualizer`; it dispatches supported
chart types to `D2Charts`. New code may use validated `render(request)`. The
fluent `set*().draw()` methods are deprecated but retained until the published
v2.0 removal window. For unsupported type IDs, register a direct chart
definition rather than adding an unverified type to the facade.

Support evidence covers packed CommonJS consumers, strict TypeScript
declarations, Chromium rendering/resize/export/ARIA smoke, and deterministic
Jest tests. Safari, Firefox, server-side rendering and high-volume performance
are not certified by this matrix.
