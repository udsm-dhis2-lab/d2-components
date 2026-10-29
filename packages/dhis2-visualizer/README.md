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

Aggregate analytics acquisition is centralized by the facade. A direct-module
consumer can optionally use the lightweight analytics entry point and still
keep the renderer independent:

```ts
import { D2AnalyticsFacade } from '@iapps/d2-visualizer/analytics';
import { D2Charts } from '@iapps/d2-charts';

const data = await new D2AnalyticsFacade()
  .setSelections(selections)
  .getData();

new D2Charts().setId('chart').setConfig(config).setData(data).draw();
```

`D2Charts` has no dependency on `@iapps/d2-visualizer`; consumers that already
have analytics data can continue to call `setData()` directly.

For a chart favorite, the facade keeps the same card-independent renderer and
centralized acquisition flow. The host element is owned by the application:

```ts
import { D2Visualizer } from '@iapps/d2-visualizer';

const visualizer = new D2Visualizer().setId('chart-host')
  .setType('SCATTER').setConfig(favorite);
await visualizer.draw(); // analytics filters from the favorite are respected
visualizer.download('PNG');
await visualizer.dispose();
```

The dashboard card, if used, owns its title, fullscreen and download controls;
it does not replace `D2Charts`. For direct chart extensions, use
`@iapps/d2-charts/extensions` and inject the registry into `D2Charts`.

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
