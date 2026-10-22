# dhis2-visualizer characterization baseline

Sprint 01 records these observed behaviors as defects or design gaps. Tests may
capture the surrounding behavior, but these entries are not approval to retain
the defect permanently.

- `DICTIONARY` and `MAPBOX` are accepted public visualization types but the
  facade currently returns without selecting or rendering an implementation.
- Single-value, custom and tracked-entity renderers are not retained by the
  facade, so facade download/disposal cannot reach them.
- Repeated facade draws replace the active renderer without disposing the
  previous renderer.
- Chart and map rendering use fixed delays, creating stale-render and teardown
  risks. Characterization tests control these boundaries rather than waiting.
- Custom templates currently inject configured HTML and CSS directly into the
  host. Security remediation is deferred to its planned sprint.
- Map provider credentials and an account-specific style are embedded in
  production source. Tests use provider mocks and never use these credentials.
- Map bounds use the first layer only and empty/invalid collections are not
  handled consistently.
- Data access is split between `Fn.Analytics`, `fetch` and global `window.d2Web`.
  Tests block real network access and provide deterministic substitutes.
