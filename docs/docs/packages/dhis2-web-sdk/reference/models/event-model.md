---
title: DHIS2Event
---

# DHIS2Event

`DHIS2Event` is the mutable event model used by `eventModule` and by tracker enrollments.

## Main properties

- `event`
- `program`
- `programStage`
- `orgUnit`
- `trackedEntity`
- `enrollment`
- `status`
- `occurredAt`
- `scheduledAt`
- `dataValues`
- `assignedUser`
- `geometry`

## Important getter

### `isCompleted`

```ts
if (event.isCompleted) {
  // ...
}
```

## Important methods

- `complete()`
- `setEventDate(eventDate)`
- `setDataValue({ dataElement, value, code? })`
- `setFields(program)`
- `getDataValue(dataElement)`
- `setEventGeometry(coordinateValue)`
- `updateDataValues(dataValueEntities)`
- `setStatus(status)`
- `toObject()`

## Example

```ts
event.setDataValue({
  dataElement: 'RESULT_UID',
  value: 'NEGATIVE',
});

event.updateDataValues({
  eventDate: '2026-04-07',
  result: 'NEGATIVE',
});
```

## `toObject()`

Builds the payload shape used by tracker import APIs, including compact assigned-user handling.
