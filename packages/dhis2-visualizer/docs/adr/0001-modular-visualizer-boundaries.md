# ADR 0001: Modular visualizer boundaries

- Status: Accepted
- Date: 2026-10-22

## Context

`D2Visualizer` currently combines request configuration, DHIS2 data access,
renderer selection and multiple rendering engines. Subsequent sprints will
extract visualization families without breaking existing consumers.

## Decision

Keep `D2Visualizer` as the compatibility facade. New modules will depend on
contracts exported by `lib/shared/contracts`, not on another visualization
family's implementation.

The planned dependency direction is:

```text
consumer -> compatibility facade -> renderer registry
                                  -> shared contracts
chart/table/map/single/custom/tracker -> shared contracts
data-source adapters -> shared contracts
```

Each visualization family will own its renderer, transformation logic, types,
tests and public entry point. Rendering engines stay behind their owning module
and are not imported by shared core contracts.

Shared contracts define:

- render targets and requests;
- renderer lifecycle and downloads;
- analytics queries and responses;
- data-source and HTTP boundaries; and
- structured errors and warnings.

Existing root imports remain supported throughout migration. Secondary entry
points will be added only when their modules are self-contained and have clean
consumer tests. Deprecations require a compatibility adapter, documentation and
a published removal timeline.

## Dependency policy

- `scope:visualizer` projects may depend only on `scope:dhis2` workspace
  projects.
- Shared contracts must not import concrete renderer modules.
- Highcharts, Mapbox and DHIS2 runtime integrations remain peer dependencies so
  the host controls engine instances and compatible application integrations.
- Small runtime utilities owned by this package remain regular dependencies.
- Every direct emitted runtime or declaration dependency must appear in the
  published manifest.

## Consequences

- Extraction can proceed incrementally behind the facade.
- Direct module consumption becomes possible without unrelated engines after
  the relevant extraction sprint.
- The current root package still eagerly loads several engines until those
  modules are extracted.
- Runtime validation and adoption of the new contracts are deferred to the
  renderer-registry and strict-typing sprints.
