# `@iapps/d2-kpi-cards`

Standalone DHIS2 single-value/KPI card transformation and SVG rendering.

Use `buildSingleValueViewModel`, `formatSingleValue`, and `wrapText` without a
DOM. Use `SingleValueVisualizer` for rendering. Configure it with `setId()` and
`setData()`, call `draw()`, and call `dispose()` when replacing the renderer.
The package has no chart or map runtime dependencies.
