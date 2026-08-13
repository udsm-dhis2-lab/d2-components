---
title: OptionSetModule
---

# OptionSetModule

Provides metadata queries for option sets, options, and option groups.

## Getters

- `optionSet: OptionSetQuery`
- `optionGroup: OptionGroupQuery`
- `option: OptionQuery`

## Example

```ts
const response = await d2.optionSetModule.optionSet
  .select(['id', 'name', 'valueType'])
  .with(d2.optionSetModule.option.select(['id', 'code', 'displayName']))
  .get();
```

## Best use cases

- select input choices
- metadata-driven radio/dropdown options
- rule actions involving options or option groups
