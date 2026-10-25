# Public API compatibility matrix

| Existing API | Supported API | Status | Removal |
| --- | --- | --- | --- |
| `setId`, `setType`, `setConfig`, `setSelections`, `setData`, then `draw()` | `render(request)` | Deprecated compatibility adapter | v2.0 |
| `setChartType()` | Discriminated `request.type` | Deprecated | v2.0 |
| Root wildcard renderer/model exports | Explicit root contracts | Internal exports hidden | Current release |
| `MAPBOX`, `DICTIONARY` public type values | No request variant | Unsupported and rejected at runtime | Current release |
| Root request imports | `@iapps/d2-visualizer` | Supported | Stable |
| Type-only contracts | `@iapps/d2-visualizer/contracts` | Supported secondary entry point | Stable |
| Runtime validation | `@iapps/d2-visualizer/validation` | Supported secondary entry point | Stable |
| Root `MapLayerConfiguration` import | Explicit root compatibility export backed by `@iapps/d2-maps` | Supported | Stable |

The request API validates its discriminator, target, configuration, selections,
tracker inputs and provider configuration before fetching data or modifying the
DOM. Fluent APIs remain operational during the migration window.
