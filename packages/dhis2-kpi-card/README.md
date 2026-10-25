# `@iapps/d2-kpi-cards`

Standalone DHIS2 single-value/KPI card transformation and SVG rendering.

Use `buildSingleValueViewModel`, `formatSingleValue`, and `wrapText` without a
DOM. Use `SingleValueVisualizer` for rendering. Configure it with `setId()` and
`setData()`, call `draw()`, and call `dispose()` when replacing the renderer.
The package has no chart or map runtime dependencies.

## Installation

`npm install @iapps/d2-kpi-cards`

## Usage

Use `SingleValueVisualizer` or its pure formatting helpers. See
`examples/basic.mjs`.

## Lifecycle

Call `dispose()` when the SVG host is removed or reused.

## Errors

Missing values use the tested empty-value representation.

## Security

Labels and values use SVG/DOM text APIs; markup is not evaluated.
