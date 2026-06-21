---
title: Querying program metadata
---

# Querying program metadata

Program metadata is the foundation for many tracker and event applications. The SDK makes it possible to retrieve a program together with:

- stages
- stage sections
- stage data elements
- tracked entity attributes
- option sets
- program rule variables
- program rules

## Fetch a program with nested metadata

```ts
const d2 = await D2Web.getInstance({});

const response = await d2.programModule.program
  .select([
    'id',
    'code',
    'name',
    'programType',
    'trackedEntityType',
    'useFirstStageDuringRegistration',
  ])
  .byId('PROGRAM_UID')
  .with(
    d2.programModule.programStage
      .select([
        'id',
        'name',
        'repeatable',
        'autoGenerateEvent',
        'preGenerateUID',
      ])
      .with(d2.programModule.programStageSection.select(['id', 'name']))
      .with(
        d2.programModule.programStageDataElement.with(
          d2.dataElementModule.dataElement
            .select(['id', 'code', 'name', 'valueType', 'optionSetValue'])
            .with(
              d2.optionSetModule.optionSet
                .select(['id', 'name', 'valueType'])
                .with(
                  d2.optionSetModule.option.select(['id', 'code', 'displayName'])
                ),
              'ToOne'
            ),
          'ToOne'
        )
      )
  )
  .with(
    d2.programModule.programTrackedEntityAttribute.with(
      d2.programModule.trackedEntityAttribute
        .select([
          'id',
          'code',
          'name',
          'valueType',
          'generated',
          'pattern',
          'unique',
        ])
        .with(
          d2.optionSetModule.optionSet
            .select(['id', 'name'])
            .with(d2.optionSetModule.option.select(['id', 'displayName'])),
          'ToOne'
        ),
      'ToOne'
    )
  )
  .with(
    d2.programModule.programRuleVariable
      .select(['id', 'name', 'programRuleVariableSourceType'])
      .with(d2.dataElementModule.dataElement.select(['id', 'code', 'name']), 'ToOne')
      .with(
        d2.programModule.trackedEntityAttribute.select(['id', 'code', 'name']),
        'ToOne'
      )
  )
  .get();

const program = response.data;
```

## Use derived getters

When the response is a `Program` instance, you can use derived getters.

```ts
if (program && !Array.isArray(program)) {
  console.log(program.trackedEntityAttributes);
  console.log(program.searchableTrackedEntityAttributes);
  console.log(program.reservedTrackedEntityAttributes);
  console.log(program.dataElements);
  console.log(program.displayInListDataElements);
}
```

## Typical use cases

### Build a registration form

Use `program.trackedEntityAttributes`.

### Build a stage form

Use `program.dataElements.filter(...)` by stage.

### Build a search UI

Use `program.searchableTrackedEntityAttributes`.

### Build a line list

Use `program.displayInListTrackedEntityAttributes` and `program.displayInListDataElements`.

## Fetch program rules

The SDK also supports generic program rule queries.

```ts
const rules = await d2.programModule.programRule
  .where({
    attribute: 'program.id' as any,
    value: 'PROGRAM_UID',
  })
  .with(
    d2.programModule.programRuleAction
      .select([
        'id',
        'programRuleActionType',
        'data',
        'displayContent',
        'content',
      ])
      .with(d2.dataElementModule.dataElement.select(['id', 'code', 'name']), 'ToOne')
      .with(
        d2.programModule.trackedEntityAttribute.select(['id', 'code', 'name']),
        'ToOne'
      )
  )
  .get();
```
