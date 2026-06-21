---
title: Working with tracked entities
---

# Working with tracked entities

Use `trackerModule` when you want to search, load, create, or save tracked entities and enrollments.

## Basic search

```ts
const response = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setOuMode('DESCENDANTS')
  .get();
```

## Filter by tracked entity attribute

```ts
import {
  DataFilterCondition,
  DataQueryFilter,
  Pager,
} from '@iapps/d2-web-sdk';

const response = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setOuMode('DESCENDANTS')
  .setFilters([
    new DataQueryFilter()
      .setAttribute('ATTRIBUTE_UID')
      .setCondition(DataFilterCondition.Equal)
      .setValue('ABC-123'),
  ])
  .setPagination(new Pager({ page: 1, pageSize: 25 }))
  .get();
```

## Filter by data element

When `attributeType` is `DATA_ELEMENT`, the query builder first queries events and then resolves matching tracked entities.

```ts
const response = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setFilters([
    new DataQueryFilter()
      .setAttribute('DATA_ELEMENT_UID')
      .setCondition(DataFilterCondition.Equal)
      .setValue('POSITIVE')
      .setType('DATA_ELEMENT')
      .setProgramStage('STAGE_UID'),
  ])
  .get();
```

## Load by tracked entity ID

```ts
const response = await d2.trackerModule.trackedEntity
  .setTrackedEntity('TRACKED_ENTITY_UID')
  .get();
```

## Date range and status

```ts
const response = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setStartDate('2026-01-01')
  .setEndDate('2026-03-31')
  .setStatus('ACTIVE')
  .get();
```

## Event-status-assisted tracker search

```ts
const response = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setEventStatus('COMPLETED', 'STAGE_UID')
  .get();
```

## Create a draft tracked entity

```ts
const draft = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .create();
```

This:

- generates a tracked entity ID if missing
- builds fields from program metadata
- creates auto-generated program-stage events when configured in metadata
- requests reserved values for generated tracked entity attributes when possible

## Save a tracked entity

```ts
const draft = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .create();

draft.updateDataValues({
  firstName: 'Amina',
  lastName: 'Said',
  enrollmentDate: '2026-04-01',
});

const saveResponse = await d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setData(draft)
  .save();
```

## Typed query pattern

```ts
@TrackedEntityDecorator({
  program: 'PROGRAM_UID',
  trackedEntityType: 'TETYPE_UID',
})
class PersonRegistration extends TrackedEntityInstance {
  @AttributeFieldDecorator('FIRST_NAME_UID')
  firstName!: string;

  @AttributeFieldDecorator('LAST_NAME_UID')
  lastName!: string;
}

const query = d2.trackerModule.getTrackedEntityQuery(PersonRegistration as any);
const draft = await query.setOrgUnit('ORG_UNIT_UID').create();
draft.firstName = 'Amina';
draft.lastName = 'Said';

await query.setData(draft).save();
```

## Fetch scope

`get(...)` accepts an optional config:

```ts
const response = await d2.trackerModule.trackedEntity.get({
  fetchScope: 'ENROLLMENT',
});
```

Use this when you want to read from the enrollments endpoint rather than the tracked entities endpoint.
