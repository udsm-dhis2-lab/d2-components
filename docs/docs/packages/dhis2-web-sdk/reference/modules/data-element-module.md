---
title: DataElementModule
---

# DataElementModule

Provides metadata queries for data elements.

## Getter

### `dataElement: DataElementQuery`

A metadata query based on `BaseQuery<DataElement, DataElementProperty>`.

## Example

```ts
const response = await d2.dataElementModule.dataElement
  .select(['id', 'code', 'name', 'valueType', 'optionSetValue'])
  .get();
```

## Common relation pattern

```ts
const response = await d2.programModule.programStageDataElement
  .with(
    d2.dataElementModule.dataElement
      .select(['id', 'code', 'name', 'valueType'])
      .with(d2.optionSetModule.optionSet.select(['id', 'name']), 'ToOne'),
    'ToOne'
  )
  .get();
```

## Best use cases

- stage field metadata
- option-set-aware form controls
- value type inspection
- data-element-driven reporting UIs
