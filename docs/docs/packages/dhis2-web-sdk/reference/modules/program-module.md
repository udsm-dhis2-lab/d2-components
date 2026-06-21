---
title: ProgramModule
---

# ProgramModule

Provides metadata queries related to programs, stages, rules, and tracked entity attributes.

## Getters

- `program: ProgramQuery`
- `programStage: ProgramStageQuery`
- `programSection: ProgramSectionQuery`
- `programStageSection: ProgramStageSectionQuery`
- `programStageDataElement: ProgramStageDataElementQuery`
- `programRule: ProgramRuleQuery`
- `programRuleAction: ProgramRuleActionQuery`
- `programRuleVariable: ProgramRuleVariableQuery`
- `programTrackedEntityAttribute: ProgramTrackedEntityAttributeQuery`
- `trackedEntityAttribute: TrackedEntityAttributeQuery`
- `trackedEntityType: TrackedEntityTypeQuery`
- `trackedEntityTypeAttribute: TrackedEntityTypeAttributeQuery`

## Query style

All of these are metadata queries built on `BaseQuery`, so they support the generic metadata operations:

- `select(...)`
- `where(...)`
- `byId(...)`
- `with(...)`
- `paginate(...)`
- `get()`

## Example

```ts
const response = await d2.programModule.program
  .select(['id', 'name', 'programType'])
  .byId('PROGRAM_UID')
  .with(d2.programModule.programStage.select(['id', 'name']))
  .get();
```

## Best use cases

Use `ProgramModule` to power:

- program metadata screens
- dynamic form generation
- field search configuration
- line-list column selection
- rule evaluation bootstrapping
