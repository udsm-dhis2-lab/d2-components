---
title: Shared primitives
---

# Shared primitives

## `BaseQuery<T, U>`

Generic metadata query builder.

### Methods

- `select(fields)`
- `paginate(pager)`
- `byId(id)`
- `where({ attribute, value })`
- `with(modelQuery, relationshipDirection?)`
- `query()`
- `dhisUrl()`
- `get()`

## `Pager`

Pagination helper for both metadata and tracker/event requests.

```ts
const pager = new Pager({
  page: 1,
  pageSize: 50,
  paging: true,
});
```

### Method

- `getPagingQueryParams()`

## `DataQueryFilter`

Tracker/event filter builder.

### Methods

- `setAttribute(attribute)`
- `setCondition(condition)`
- `setValue(value)`
- `setType(type)`
- `setProgramStage(programStage)`
- `toApiFilters(filterKey?)`
- static `getApiFilters(filters, filterKey?)`

## `DataOrderCriteria`

Ordering helper.

### Methods

- `setField(field)`
- `setOrder(order)`
- `getQueryParams()`

## Common shared types

### `DataFilterCondition`

- `In`
- `Equal`
- `NotEqual`
- `Like`
- `Ilike`
- `LessThan`
- `LessThanOrEqualTo`
- `GreaterThan`
- `GreaterThanOrEqualTo`

### `OuMode`

- `'ALL'`
- `'DESCENDANTS'`
- `'SELECTED'`
- `'CHILDREN'`
- `'ACCESSIBLE'`

### `EnrollmentStatus`

- `'ACTIVE'`
- `'COMPLETED'`
- `'CANCELLED'`

### `EventStatus`

- `'ACTIVE'`
- `'COMPLETED'`
- `'VISITED'`
- `'SCHEDULE'`
- `'OVERDUE'`
- `'SKIPPED'`

### `ProgramDateType`

- `'ENROLLED_ON'`
- `'OCCURED_ON'`

### `AssignedUserMode`

- `'CURRENT'`
- `'PROVIDED'`
- `'NONE'`
- `'ANY'`

## Utility exports commonly used directly

- `generateUid`
- `parseCoordinates`
- `QueryCondition`
- `D2Window`
