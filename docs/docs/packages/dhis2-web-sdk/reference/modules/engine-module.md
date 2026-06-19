---
title: D2EngineModule
---

# D2EngineModule

Provides browser-side execution helpers.

## Getter

### `programRule`

Returns a fresh `ProgramRuleEngine`.

```ts
const engine = d2.engineModule.programRule;
```

This is equivalent to:

```ts
const engine = new ProgramRuleEngine();
```

## Main use case

Evaluate DHIS2-like program rule actions locally while the user is filling a form, without round-tripping to the server on every field change.
