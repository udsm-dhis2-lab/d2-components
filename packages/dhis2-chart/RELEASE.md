# Sprint 19 release review

## Sprint 20 multi-axis update

The two supplied saved DHIS2 configurations now have sanitized deterministic
fixtures and direct/facade tests. `COLUMN` can infer numeric axes from
`series[].axis` when `axes` is empty; optional per-item `LINE` types survive
model serialization. Array-form `yAxisType` is normalized at the chart
definition boundary, correcting observed all-zero values for that layout.
Explicit-axis and existing one-axis tests remain green. Inferred sides use a
documented deterministic left/right alternation, but trusted DHIS2 screen
output for these exact favorites was not available in this environment, so
axis side/offset visual parity is **not certified**. Do not present this as a
DHIS2-verified layout rule until a comparison is recorded. Roll back the
Sprint 20 validator, inferred-axis transform, model/adapter fields and layout
normalization together if consumers report a regression; no persisted data
migration is involved. Chart Jest: 153 passed, 7 todo; facade Jest: 75 passed.
Chart and facade builds/lints, packed consumers, declarations, browser smoke,
accessibility smoke and bundle gates pass. Chart emitted JS is now
203,770/205,000 bytes, leaving only 1,230 bytes headroom. The full Nx test
target remains blocked by a recursive task chain; shared analytics lint and
tests remain failing for reasons outside this sprint. The existing Sprint 19
release blockers below remain.

Status: **not ready for workspace-wide promotion** as of 2026-10-29. The chart
and facade package gates pass, but shared `dhis2-analytics` lint and tests do
not. Do not publish or change the Highcharts major based on this review.

## Architecture and compatibility

- `D2Charts` remains the direct renderer; `D2Visualizer` still dispatches to it.
- Root, `/model`, and `/extensions` are the explicit package entries. The
  extension entry exposes a checked registry/definition contract without
  importing Highcharts. Existing documented root imports, fluent APIs and
  deprecated class aliases remain available.
- No built-in type was added. BUBBLE and a general theme API remain deferred
  pending verified writable data and presentation contracts.
- Optional Highcharts modules are initialized on first need, not on package
  import. A full browser bundle of the root entry can still contain their code
  because synchronous CommonJS requires are statically bundled; consumers
  needing a Highcharts-free entry should use `/model` or `/extensions`.

## Validation matrix

| Gate | Result | Evidence |
| --- | --- | --- |
| Chart/facade build and lint | Pass | Nx `run-many` without cache; shared dependencies built. |
| Chart tests | Pass via Jest fallback | 143 passed, 7 todo; Nx target reports a recursive task-invocation chain. Coverage: 83.97% lines, 72.96% branches. |
| Facade tests | Pass via Jest fallback | 74 passed; coverage: 40.16% lines, 38.98% branches. |
| Shared analytics build | Pass | Nx build. |
| Shared analytics lint | Fail, pre-existing | 34 errors and 88 warnings, primarily legacy `var`/`prefer-const` diagnostics. |
| Shared analytics tests | Fail, pre-existing | Live `play.dhis2.org` DNS/timeouts and test imports of missing `../index`. |
| Chart packed consumer/declarations | Pass | Clean temporary npm install, root/model/extensions imports, strict TypeScript, no-DOM model and rejected deep imports. |
| Facade packed consumer | Pass | Clean temporary install and import matrix. |
| API/export map | Pass | Nx `dhis2-chart:api-check`. |
| Bundle budgets | Pass after recalibration | Chart emitted JS 198,986/205,000 bytes; model 119,350/125,000; extensions 115,712/122,000; runtime excluding Highcharts 137,194/145,000. Optional module budgets pass individually. |
| Browser/accessibility | Pass, bounded | Chromium SVG, ARIA, resize, category export and scatter smoke. No cross-browser audit. |
| Security | Pass, bounded | Source scan/release-review and offline production `npm audit` (0 advisories in local cache). Online advisory freshness and manual penetration review remain unverified. |
| Examples/category dependency | Pass | Chart basic/normalized/extension examples, facade examples smoke and removed-plugin dependency check. |

The previous emitted chart budget of 110,000 bytes was set before the approved
chart-model, registry, YOY and scatter work. It was not a viable gate for the
current feature set (198,986 bytes). It is now 205,000 bytes, giving about 3%
headroom; the separate minified entry and optional-module budgets provide
finer regression detection. This is a budget rebaseline, not a performance
improvement claim.

## Release blockers and remaining risk

1. Repair or explicitly waive the shared analytics lint/test failures, replace
   live-network tests with deterministic fixtures, and rerun the full Nx matrix.
2. Diagnose Nx's recursive test-task chain; a direct Jest pass is not a green
   Nx test target.
3. Confirm online dependency advisories, Safari/Firefox behavior, and
   high-volume rendering/performance before a broad production release.
4. The root browser bundle may include unused optional Highcharts module code.
   Model and extension entries are Highcharts-free, but full root tree-shaking
   remains a limitation of synchronous module initialization.
5. Public root compatibility includes legacy definition classes and the
   deprecated fluent APIs. Remove only on the documented major-version
   timeline; no Highcharts major upgrade is bundled here.

## Rollback

Before publication, revert the Sprint 19 API/export-map, lazy-module and
budget changes together, then rerun chart/facade build and packed-consumer
checks. After publication, restore the last known-good package artifacts via
a new patch release (do not unpublish), pin consumers to that version, and
revert the `/extensions` adoption in consumers. No persisted data migration is
introduced by this sprint.
