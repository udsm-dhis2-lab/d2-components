# Changelog

## Unreleased

- Fixed fetched analytics being passed to array-oriented renderers as wrapped
  row objects, which caused valid values to render as zero.
- Added the `@iapps/d2-visualizer/analytics` acquisition and normalization
  facade for facade and opt-in direct-renderer consumers.
- Clear request-scoped supplied data when a later request needs fresh data.
- Added runnable facade and direct-module examples.
- Added emitted JavaScript bundle budgets and automated release/security review gates.
- Completed package usage, lifecycle, error, security, migration and rollback guidance.
- Removed superseded commented implementations after characterization coverage was in place.
- Replaced remaining visualizer-owned unsafe DOM interpolation with text-based DOM construction.

No deprecated compatibility API is removed by this release candidate.
