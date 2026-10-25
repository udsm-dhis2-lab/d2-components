# `@iapps/d2-pivots`

Standalone DHIS2 report-table and pivot-table calculations, DOM rendering and
CSV/XLS downloads. `D2TableEngine` performs analytics transformations without
a DOM. Configure `D2Pivots` through its fluent setters, call `draw()`, and call
`dispose()` when replacing it. `TableUtil` remains an alias for existing
consumers. The package has no chart or map dependencies.

## Installation

`npm install @iapps/d2-pivots`

## Usage

Use `D2Pivots`; `TableUtil` remains its compatibility alias. See
`examples/basic.mjs`.

## Lifecycle

Configure data before `draw()` and call `dispose()` on replacement.

## Errors

Reject malformed analytics before transformation. Downloads require a rendered
table host.

## Security

Cells use DOM text APIs; external values remain data in rendered/downloaded
output.
