# `@iapps/d2-maps`

Standalone DHIS2 GeoJSON loading, transformation and open-source MapLibre GL
rendering. Supply a MapLibre-compatible `{ style }` URL or style object through
`D2Maps.setProviderConfig()` for a configured basemap. `mapbox://` style URLs
are rejected. The deprecated `accessToken` property remains accepted for API
compatibility but is never passed to MapLibre. Without a provider style, the
renderer uses a credential-free blank style so GeoJSON overlays remain visible;
it does not interpret DHIS2 basemap IDs as provider URLs.
`MapVisualizer` remains an alias for existing
consumers. Inject a `MapDataSource` into each
`MapLayer`; call `draw()` and `dispose()` when replacing the renderer.

Credentials previously committed to the visualizer have been removed. The
provider account owner must revoke those exposed values and issue restricted
replacement credentials outside this repository before production use.

Layer requests settle independently and retain configured order. Failed layers
are reported by `layerFailures`; valid layers continue rendering. Empty layers
do not trigger bounds fitting.

Tracker-map support is exposed from this same entry point through
`TrackedEntityLayer`, `TrackedEntityInstanceData`, and the validated tracker
filter utilities.

## Installation

`npm install @iapps/d2-maps maplibre-gl@^5.24.0`

## Usage

Use `D2Maps`, add `MapLayer` instances and provide runtime provider config. See
`examples/basic.mjs`.

For saved DHIS2 maps, use `parseSavedMap(payload, '2.41.3' | '2.43')` at the
boundary and `serializeSavedMap(request)` when writing a compatible payload.
The Core version must come from the caller's verified server contract; it is
not inferred from a retained field. The parser decodes `mapViews[].config`
once, validates viewport/basemap shape, preserves safe unknown properties and
classifies `thematic`, `facility`, `boundary` and `orgUnit` as currently recognized
layer requests. Other families remain unsupported; parsing them does not make
them renderable. `MapLayerRegistry` permits provider-independent definitions,
but the default `D2Maps` registry contains only the existing generic layer
behavior. Existing `new D2Maps().addLayer(...).draw()` and `D2Visualizer` MAP
facade imports remain supported.

## Geometry-only layers

`facility`, `orgUnit`, and legacy `boundary` layers request GeoFeatures but
never request analytics. `boundary` is interpreted as `orgUnit` at the saved-map
boundary without rewriting its stored identifier. Facility points and actual
associated polygon geometry retain separate feature kinds. An `areaRadius`
creates a **straight-line buffer in metres**, not an actual catchment,
road-network area, routing result, or travel-time estimate. Missing/invalid
geometry IDs are exposed on `MapLayer.missingGeometryIds`.

The renderer accepts validated six-digit hex `organisationUnitColor` and
optional explicit `groupColors` keyed by group ID. It does not derive a group
palette or icon from a group-set ID alone; consumers must supply verified group
metadata. Labels use the GeoFeature name as plain text. Arbitrary HTML label
templates and unverified icon URLs are intentionally not rendered. `hidden`,
`labels`, `opacity`, `pointRadius`, `sortOrder`, and `areaRadius` are supported;
provider-side labels require a style with a glyph source.

No geometry/value cache is currently active. A future cache must key by
selections, access context, coordinate source, Core/app version and source
definition; tracker data must never be reused across users.

## Thematic capability limits

An explicit `layer: 'thematic'` with `thematicMapType: 'CHOROPLETH'` or
`'BUBBLE'` uses the pure `joinThematicData`/`buildThematic` path and a separate
MapLibre style adapter. Geometry joins by OU ID; missing geometry, absent/null
value, valid zero and out-of-class values remain distinct. Choropleths require
polygon geometry. Bubbles accept a point or derive a representative point from
a polygon; radius is linearly scaled between configured pixel limits, **not**
claimed to be area-proportional. Neither mode sums values across OUs. Rates and
density indicators must be supplied as already calculated analytics values.

| Method | Status | Required inputs |
| --- | --- | --- |
| 1 predefined | Supported | Concrete `legendSet.legends` with finite intervals and colours. |
| 2 equal intervals | Supported | 1–20 classes and one colour per class; last class includes its maximum. |
| 3 equal counts | Supported | 1–20 classes and one colour per class; tied values stay in the same class. |
| 4–5 natural breaks | Deferred | Target-app cluster and gap fixtures. |
| 6 pretty | Deferred | Target-app rounding/boundary fixtures. |
| 7 logarithmic | Deferred | Target-app zero/negative fixtures. |
| 8 standard deviation | Deferred | Target-app extreme-value fixtures. |
| 10 single colour | Supported for bubbles only | One colour and radius limits from 0–50 px. |

Other methods throw a clear deferred-method error on the explicit thematic
path. `noDataLegend` and `unclassifiedLegend` colours in encoded map-view
configuration are recognized; missing-value and unclassified entries appear
in the legend when present. Legacy `thematic1` views using method 3 also use
this classifier. If such a view saves no colour scale, the library applies its
five-colour yellow-to-green fallback (sampled for 1–5 classes). This is a
documented compatibility fallback, **not** a verified DHIS2 default palette;
provide a saved colour scale for exact colour matching. Other older payloads
retain the generic `MapLayer` path. Source-model fields and
the pinned Maps-app catalogue are not proof of a target installation's
writable map contract.

The map data source accepts both canonical object rows and DHIS2 analytics
header/array rows (including wrapped responses). It resolves `ou` and `value`
by header name and keeps valid zero distinct from null. Multiple rows for one
OU retain the historical first-row behavior; rates and densities are never
summed implicitly.

The emitted map JavaScript budget is defined in
`tools/visualizer-bundle-budgets.json`; it is a package-output budget, not a
browser minified/gzipped transfer-size claim.

The Angular demo copies MapLibre's CSP worker to `assets/` and calls
`setWorkerUrl()` before any map is constructed. Other consumers with strict
`worker-src 'self'` policies must serve and configure the worker similarly.

## Lifecycle

Await `draw()` and call `dispose()` on replacement; owned provider resources
are removed. A newer draw aborts the older load and prevents stale results
from constructing or painting a provider map. Failed configured layers remain
available for the next draw; only successfully loaded layers are painted.

## Errors

Layer failures are recorded in `layerFailures`; successful layers continue.

## Security

No Mapbox credential is required. Tracker popup values, URLs, colors and expressions
are validated before rendering.
