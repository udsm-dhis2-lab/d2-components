# Release readiness and operations

## Candidate checklist

- Run all Nx build, test and lint targets without cache.
- Run `dhis2-visualizer:bundle-budget` and `release-review`.
- Run every package `consumer-smoke` target against packed artifacts.
- Build the representative `demo` and `ng-dhis2-dashboard` consumers.
- Confirm root, `/contracts`, and `/validation` TypeScript imports.
- Review generated declarations and packed manifests before publishing.

## Browser compatibility

The supported baseline follows the workspace Browserslist configuration:
current Chromium, Firefox and WebKit/Safari engines. The deterministic jsdom
suite covers DOM ownership and accessibility semantics; the demo production
build is the release browser integration artifact. Provider-backed map behavior
must receive a manual smoke in Chromium, Firefox and Safari before promotion.

## Accessibility review

Tables retain table roles and accessible labels, KPI SVG output retains text
alternatives, and custom/tracker values are emitted as text. Release review must
include keyboard navigation, focus visibility, zoom at 200%, screen-reader
labels and high-contrast checks in the representative application. Automated
coverage is necessary but is not a substitute for this manual review.

## Security review

The automated review rejects dynamic `Function`, production `innerHTML`, unsafe
Mapbox popup HTML and likely embedded provider tokens. Custom template and
tracker adversarial suites are release gates. Consumers remain responsible for
restricting and rotating runtime provider credentials.

## Versioning and support

Publish the extracted modules and facade with one aligned version. Breaking
removals require a major version. Deprecated fluent APIs and aliases remain
through v1 and are scheduled for v2.0. Support reports must include package
versions, visualization type, sanitized configuration, browser, and a minimal
reproduction without credentials or patient data.

## Rollback plan

1. Stop promotion and retain the previous npm dist-tag.
2. Repoint the stable dist-tag to the last verified aligned package versions.
3. Roll back all visualizer modules together; do not mix incompatible facade
   and renderer versions.
4. Restore the previous application lockfile and redeploy the packed candidate
   used by compatibility tests.
5. Revoke provider credentials if the incident involves map configuration.
6. Preserve failing artifacts and logs, then add a regression test before a new
   candidate.

## Residual risks

- Map provider behavior and assistive-technology output still require manual
  browser/device verification.
- Legacy fluent configuration accepts broader shapes than validated requests.
- Overall facade coverage remains lower than module security-critical coverage.
- Large third-party peers dominate installed size and are outside emitted-code
  budgets.
- Deprecated APIs increase maintenance surface until the v2 removal window.
