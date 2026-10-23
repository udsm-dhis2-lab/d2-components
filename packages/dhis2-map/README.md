# `@iapps/d2-maps`

Standalone DHIS2 GeoJSON loading, transformation and Mapbox-compatible rendering.
Provider credentials are never bundled. Supply `{ style, accessToken? }` through
`MapVisualizer.setProviderConfig()`. Inject a `MapDataSource` into each
`MapLayer`; call `draw()` and `dispose()` when replacing the renderer.

Credentials previously committed to the visualizer have been removed. The
provider account owner must revoke those exposed values and issue restricted
replacement credentials outside this repository before production use.

Layer requests settle independently and retain configured order. Failed layers
are reported by `layerFailures`; valid layers continue rendering. Empty layers
do not trigger bounds fitting.
