---
title: EventModule
---

# EventModule

Provides event-specific query builders.

## Getter

### `event: BaseEventQuery<DHIS2Event>`

Creates a generic event query.

## Method

### `getEventQuery<T extends DHIS2Event>(model: T): ModelBaseEventQuery<T>`

Creates a typed event query bound to a custom event model.

## `BaseEventQuery` API

### Query context

- `setOrgUnit(orgUnit: string | string[])`
- `setOuMode(ouMode)`
- `setProgram(program)`
- `setProgramStage(programStage)`
- `setEvent(event)`
- `setTrackedEntity(trackedEntity)`
- `setEnrollment(enrollment)`

### Filters and ordering

- `setFilters(filters)`
- `setAttributeFilters(filters)`
- `setOrderCriterias(orderCriterias)`
- `setPagination(pager)`
- `setFields(fields)`

### Dates and status

- `setStartDate(startDate, dateType?)`
- `setEndDate(endDate, dateType?)`
- `setStatus(status)`

### Data and persistence

- `setData(data)`
- `create()`
- `get()`
- `save()`
- `getMetaData()`

### Deprecated alias

- `byEventId(event)`

## `ModelBaseEventQuery`

The typed variant sets:

- `identifiable`
- a fresh typed instance
- `program` from the model instance

## Current-source note

The underlying URL generator supports:

- `assignedUserMode`
- `assignedUser`

but the current `BaseEventQuery` does not expose setters for them. Extend the query or use `httpInstance` when you need that filter pattern.
