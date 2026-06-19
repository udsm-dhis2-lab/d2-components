---
title: Program rule engine
---

# Program rule engine

The SDK includes a browser-side `ProgramRuleEngine` for evaluating program rules against local field values.

## Create an engine

```ts
import { ProgramRuleEngine } from '@iapps/d2-web-sdk';

const engine = new ProgramRuleEngine();
```

## Set rules and values

```ts
const actions = engine
  .setRules(program.programRules || [])
  .setDataValues({
    age: 17,
    result: 'POSITIVE',
    enrollment_date: '2026-04-07',
  })
  .execute();
```

## Execute options

`execute(...)` supports:

```ts
engine.execute({
  triggeredOnly: true,
  dedupeByField: true,
  debug: false,
});
```

### `triggeredOnly`

Defaults to `true`.

When `true`, only triggered actions are returned.

### `dedupeByField`

Defaults to `true`.

When `true`, the engine keeps the last action for a given field.

### `debug`

When `true`, each returned action includes debug metadata such as:

- raw condition
- prepared condition
- evaluation success/error
- whether the rule triggered

## Supported placeholder styles

The engine prepares expressions by resolving placeholders like:

- `A{attributeUid}`
- `V{variableName}`
- `#{dataElementUid}`
- `{plainKey}`

It also resolves `d2:` expressions through the provided expression utilities.

## Assign actions

When an action has type `ASSIGN`, the engine evaluates the assigned expression and returns the computed value in `assignedData`.

## Example UI workflow

A common form workflow is:

1. fetch metadata and rules
2. collect current form values
3. call `execute(...)`
4. map returned actions to UI effects such as:
   - hide field
   - show warning
   - assign value
   - make field mandatory
   - restrict option set choices

## Example

```ts
const formValues = {
  age: 17,
  referral_required: true,
  result: 'POSITIVE',
};

const actions = new ProgramRuleEngine()
  .setRules(program.programRules || [])
  .setDataValues(formValues)
  .execute({ debug: true });

console.log(actions);
```

## Important note

The current engine evaluates prepared JavaScript expressions with `new Function(...)`. It is powerful and practical for browser-side rule processing, but you should still treat rules as trusted configuration coming from your DHIS2 environment.
