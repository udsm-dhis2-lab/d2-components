# Earth Engine adapter: deferred contract (Sprint 29)

Live support is **not enabled**. The Sprint 29 entry gate is unmet as of 5 November 2026.

| Required evidence | Current finding |
| --- | --- |
| Administrator-enabled EE source registry | Not installed or supplied. The external-source registry supports WMS, XYZ/TMS, vector-style and GeoJSON URL, not EE definitions. |
| Target-instance saved map export and schema | Only an illustrative, sanitized Sprint 21 fixture exists. No target-instance export/schema or Core/Maps-app version evidence was provided. |
| Lawful provider credential and access policy | No approved server-side credential, rotation owner, audience, OU/facility scope or service proxy is defined. |
| Representative imagery/statistics responses | None from the target service. The catalogue lists source families, not their deployed response contract. |
| Approved product need | No specific source, band, period, region and statistic selected for implementation. |
| Prior sprint exit gate | The map bundle budget remains above its configured limit; Sprint 28 is not release-ready. |

The catalogue is reference material, not a target-instance writable contract. Its source IDs are registry selectors, not arbitrary EE asset IDs. The existing saved-map boundary retains and round-trips encoded EE selections, but classifies them as unsupported. `D2Maps` records a clear layer failure before any geometry, analytics, provider or EE request. Supported sibling layers may still load. No credentials or EE service endpoints are bundled.

Before enabling even one source, obtain a sanitized target-app saved export and source registry/schema for that source, with versions and authorization evidence. Verify the exact encoded `config.id`, `band`, `style`, `aggregationType` and `period` fields. Keep four ports separate: source resolution, imagery, spatial statistics and authorized geometry. Verify source-defined masks, temporal reducer, spatial reducer, units/conversions, resolution and nodata behavior against representative service fixtures; do not infer them from labels. Require allowlisted source/band/reducer/period combinations, bounded and cancellable requests, partial-failure reporting, attribution, and provider disposal. Browser and access tests must cover OU polygons, authorized facility buffers, mixed layers, stale loads and export limitations. A map image or feature/statistic download must never be represented as a full raster export without an explicit service contract.

This decision can be revisited only after the missing evidence and Sprint 28 release gate are resolved. The rollback for the current safety change is to remove the explicit `earthEngine` rejection definition; doing so would restore an ambiguous generic renderer and is **not recommended**.
