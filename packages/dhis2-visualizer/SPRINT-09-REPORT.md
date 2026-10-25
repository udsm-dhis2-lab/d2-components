# Sprint 09 release review

Review date: 2026-10-25

## Decision

**Hold promotion of the release candidate.** The libraries, packed artifacts,
examples and representative development build pass, but the representative
`demo:build:production` target exits unsuccessfully without an Angular
diagnostic in this environment. Manual browser/provider and assistive-
technology reviews also remain release-owner sign-offs.

## Automated evidence

- Build, lint and test targets pass without cache for the facade, chart, map,
  pivot, KPI and custom packages.
- Packed clean-install consumers pass for the facade and every direct module.
- The dashboard production build and demo development build pass.
- Runnable examples pass for the facade and every direct module.
- Security review rejects dynamic evaluation, production `innerHTML`, Mapbox
  popup HTML and likely embedded provider tokens; the gate passes.
- The unrelated-import check proves non-map module imports do not load Mapbox
  or Turf.
- Emitted JavaScript budgets pass:
  - facade: 217,039 / 240,000 bytes
  - chart: 101,946 / 110,000 bytes
  - map: 60,753 / 70,000 bytes
  - pivot: 47,930 / 55,000 bytes
  - KPI: 11,538 / 15,000 bytes
  - custom: 11,297 / 15,000 bytes

## Compatibility review

The packed facade verifies root, contracts and validation imports. Direct
packed consumers verify each extracted package. Deprecated fluent facade APIs
and aliases remain present. No public compatibility API was intentionally
removed in this sprint.

## Accessibility review

Automated table semantics, accessible labels, KPI text alternatives and safe
text rendering pass in the package suites. Keyboard navigation, focus
visibility, 200% zoom, high contrast and screen-reader output still require the
manual matrix described in `RELEASE.md`.

## Browser review

The Browserslist matrix resolves Chromium, Firefox and Safari/WebKit families.
The representative demo development bundle compiles. Promotion remains blocked
until the unexplained production-build exit is resolved and map/provider smoke
tests pass in Chromium, Firefox and Safari.

## Security review

The static release gate and adversarial custom/tracker tests pass. Remaining
operational responsibility is to inject a restricted Mapbox token at runtime,
rotate it independently of package publication and avoid including credentials
or patient data in support reproductions.

## Rollback

Keep the previous stable npm dist-tag unchanged until promotion. If a promoted
candidate must be withdrawn, repoint the tag to the last verified aligned set
of facade and module versions, restore the consumer lockfile, redeploy, and
rotate map credentials when relevant. Do not roll back only one package from an
aligned release set.

## Remaining risks

- `demo:build:production` fails silently after dependency builds; root cause is
  not established, so production integration is not signed off.
- Provider-backed maps and assistive-technology behavior need manual browser
  and device verification.
- Legacy fluent configuration accepts broader input than validated requests.
- Deprecated compatibility APIs continue to increase maintenance surface until
  the planned major-version removal window.
- Third-party peer size is outside emitted-code budgets.
