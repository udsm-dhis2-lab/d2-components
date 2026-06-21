---
title: TrackerModule
---

# TrackerModule

Provides tracker-specific query builders for tracked entities and enrollments.

## Getters and methods

### `trackedEntity: BaseTrackerQuery<TrackedEntityInstance>`

Creates a generic tracker query.

### `getTrackedEntityQuery<T extends TrackedEntityInstance>(model: T): ModelBaseTrackerQuery<T>`

Creates a typed tracker query bound to a decorated or custom tracked entity model.

## `BaseTrackerQuery` API

### Query context

- `setOrgUnit(orgUnit: string | string[])`
- `setOuMode(ouMode)`
- `setProgram(program)`
- `setProgramStage(programStage)`
- `setTrackedEntityType(trackedEntityType)`
- `setTrackedEntity(trackedEntity)`
- `setTrackedEntities(trackedEntities)`

### Filters and ordering

- `setFilters(filters)`
- `setOrderCriterias(orderCriterias)`
- `setPagination(pager)`

### Dates and status

- `setStartDate(startDate, dateType?)`
- `setEndDate(endDate, dateType?)`
- `setStatus(status, statusType?)`
- `setEventStatus(status, programStage)`

### Data and persistence

- `setData(data)`
- `create()`
- `save()`
- `get(config?)`

### Other helpers

- `setConfig(config: TrackerQueryConfig)`
- `byEventId(event)`
- `generateReservedValues(instance)`
- `setReservedValues()`
- `setInstanceFields(program)`
- `getMetaData(config?)`

## `ModelBaseTrackerQuery` additions

- constructor binds a typed model and preloads program/trackedEntityType from the model prototype
- `byId(id)` maps the provided value to the decorated `id` field when available
- overrides `generateReservedValues()` to use model field metadata

## Typical typed usage

```ts
const query = d2.trackerModule.getTrackedEntityQuery(PersonRegistration as any);
const draft = await query.setOrgUnit('ORG_UNIT_UID').create();
draft.firstName = 'Amina';
await query.setData(draft).save();
```

## Fetch behavior note

If tracker filters include data-element filters or event status, the query builder internally resolves matching tracked entities through the events endpoint before fetching the final tracker result.
