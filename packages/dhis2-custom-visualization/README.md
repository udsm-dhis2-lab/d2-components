# @iapps/d2-custom-visualizations

Safe custom-template rendering with an allowlisted HTML/CSS pipeline.

## Installation

`npm install @iapps/d2-custom-visualizations`

## Usage

Configure `CustomVisualizer` with a template, target and data. See
`examples/basic.mjs`.

## Lifecycle

Call `dispose()` before removing the host. Repeated draws replace owned content.

## Errors

Invalid markup, CSS and expressions throw typed `TemplateValidationError`s.

## Security

There is no trusted bypass. Scripts, event handlers, dangerous URLs/CSS and
executable expressions are rejected; external values are escaped.
