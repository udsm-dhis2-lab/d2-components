---
title: Current behavior and limitations
---

# Current behavior and limitations

This page captures practical implementation notes from the current source so application teams can design around them intentionally.

## Browser-only runtime

The runtime relies on `window` and `document`, and tracker/event metadata helpers read `window.d2Web`.

**Implication:** initialize and use the SDK only on the client side.

## Save responses are not guaranteed to be refreshed entities

Tracker and event `save()` operations post to:

```text
tracker?async=false
```

The server may return import-style payloads rather than fully hydrated tracker/event objects.

**Recommendation:** re-fetch after save when the UI needs authoritative state.

## Event query assigned-user filters are not fully surfaced

`EventUrlGenerator` supports:

- `assignedUserMode`
- `assignedUser`

but `BaseEventQuery` does not currently expose public setters for them.

**Recommendation:** extend the query builder or use `httpInstance` for those filters.

## Metadata `where(...)` is equality-oriented

`BaseQuery.where(...)` creates an equality filter. It does not expose a full fluent metadata-filter DSL.

**Recommendation:** use direct HTTP requests for complex metadata filtering when needed.

## Initialization order matters

Because tracker/event metadata helpers rely on `window.d2Web`, using those helpers before `D2Web.initialize(...)` can cause failures.

**Recommendation:** initialize at app bootstrap.

## SSR caution

Frameworks such as Next.js or Angular SSR need client-only guards around SDK initialization and usage.

## IndexedDB support is GET-focused

The built-in IndexedDB flow is designed around cached GET requests for supported resources and data store patterns.

**Recommendation:** treat it as a lookup/read optimization rather than a full offline sync engine.

## Prefer clear application wrappers

Even though the SDK is flexible, medium and large applications benefit from adding a thin abstraction layer:

- services/repositories
- typed query wrappers
- UI metadata adapters
- runtime providers
