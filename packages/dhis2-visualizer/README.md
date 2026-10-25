# `@iapps/d2-visualizer`

Compatibility facade for DHIS2 charts, tables, KPI cards, maps, tracker maps,
and safe custom templates. New integrations should use validated requests.

## Installation

`npm install @iapps/d2-visualizer`

Install the declared peers used by the selected visualization families.

## Usage

```ts
import { D2Visualizer } from '@iapps/d2-visualizer';
const visualizer = new D2Visualizer();
await visualizer.render({
  type: 'LINE', target: { id: 'visualization' }, configuration: {},
  data: { headers: [], rows: [], metaData: {} },
});
```

Contracts are also available from `@iapps/d2-visualizer/contracts` and runtime
validation from `@iapps/d2-visualizer/validation`. See `examples/basic.mjs`.

## Lifecycle

Repeated `render()` calls dispose the active renderer and reject stale async
results. Call `await dispose()` when the host is removed. Fluent `set*().draw()`
APIs remain compatible but are deprecated for removal in v2.0.

## Errors

Invalid requests throw `VisualizationRequestValidationError` before HTTP or DOM
work. Handle asynchronous renderer and provider failures around `render()`.

## Security

Custom templates and tracker expressions are allowlisted and external values
are escaped. Provider credentials are runtime configuration and must not be
bundled.

## Migration

See [API-MIGRATION.md](./API-MIGRATION.md) and [RELEASE.md](./RELEASE.md).
