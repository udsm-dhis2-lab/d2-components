---
title: Enrollment
---

# Enrollment

`Enrollment` represents the current or historical enrollment for a tracked entity.

## Main properties

- `enrollment`
- `program`
- `trackedEntity`
- `orgUnit`
- `enrolledAt`
- `enrollmentDate`
- `occurredAt`
- `incidentDate`
- `status`
- `geometry`
- `events`
- `programStageEvents`
- `eventEntities`

## Important getter

### `isCompleted`

```ts
if (enrollment.isCompleted) {
  // ...
}
```

## Important methods

- `setProgramStageData(programStage, dataEntities)`
- `setEventOrgUnit(orgUnit, eventId)`
- `setDataValue(dataElement, value, programStage, eventId?)`
- `setEvent(event)`
- `setGeometry(geometry)`
- `getEventsByProgramStage(programStage)`
- `toObject()`

## Use case

This model is useful when your UI is enrollment-centric and needs to manage multiple stage events as part of one workflow.
