---
title: Creating, updating, and saving data
---

# Creating, updating, and saving data

The SDK supports both metadata-driven draft creation and direct mutation of hydrated instances.

## Pattern 1: create a new tracked entity draft

```ts
const query = d2.trackerModule.trackedEntity
  .setProgram('PROGRAM_UID')
  .setOrgUnit('ORG_UNIT_UID');

const draft = await query.create();

draft.updateDataValues({
  firstName: 'Halima',
  lastName: 'Juma',
  enrollmentDate: '2026-04-01',
});

await query.setData(draft).save();
```

## Pattern 2: load then update a tracked entity

```ts
const response = await d2.trackerModule.trackedEntity
  .setTrackedEntity('TRACKED_ENTITY_UID')
  .get();

const instance = response.data as TrackedEntityInstance;

instance.updateDataValues({
  phoneNumber: '255700000000',
  orgUnit: 'NEW_ORG_UNIT_UID',
});

await d2.trackerModule.trackedEntity
  .setProgram(instance.program)
  .setData(instance)
  .save();
```

## Pattern 3: create an event draft inside an enrollment

```ts
const query = d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setTrackedEntity('TRACKED_ENTITY_UID')
  .setEnrollment('ENROLLMENT_UID');

const event = await query.create();

event.updateDataValues({
  eventDate: '2026-04-07',
  testResult: 'NEGATIVE',
});

await query.setData(event).save();
```

## Updating nested stage data from a tracked entity

```ts
instance.setProgramStageData('STAGE_UID', [
  { dataElement: 'RESULT_UID', value: 'NEGATIVE' },
  { dataElement: 'COMMENT_UID', value: 'Reviewed' },
]);
```

## Updating via typed properties

If the model uses decorators, direct property assignment updates internal SDK structures.

```ts
draft.firstName = 'Halima';
draft.lastName = 'Juma';
draft.enrollmentDate = '2026-04-01';
```

## About save responses

The SDK saves through the DHIS2 tracker import endpoint:

```ts
tracker?async=false
```

This is convenient, but it also means the server may return import-style payloads rather than a fully refreshed entity. A practical pattern is:

1. save
2. inspect `responseStatus`
3. re-fetch the entity or event if the UI needs authoritative post-save state

## Status helpers

```ts
instance.complete();
event.complete();
```

These update local model state before save.

## Geometry helpers

Tracker instance:

```ts
instance.setEnrollmentGeometry('[39.28,-6.82]');
```

Event:

```ts
event.setEventGeometry('[39.28,-6.82]');
```

Both helpers convert coordinate text into GeoJSON `Point` format.
