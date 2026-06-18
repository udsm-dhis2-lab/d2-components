---
title: Metadata query builder
---

# Metadata query builder

Metadata modules use the generic `BaseQuery<T, U>` pattern.

## Supported operations

- `select(fields)`
- `paginate(pager)`
- `byId(id)`
- `where({ attribute, value })`
- `with(relatedQuery, relationshipDirection?)`
- `query()`
- `dhisUrl()`
- `get()`

## Basic example

```ts
const d2 = await D2Web.getInstance({});

const response = await d2.programModule.program
  .select(['id', 'name', 'programType'])
  .paginate(new Pager({ page: 1, pageSize: 20 }))
  .get();
```

## Fetch by ID

```ts
const response = await d2.programModule.program
  .select(['id', 'name', 'trackedEntityType'])
  .byId('PROGRAM_UID')
  .get();
```

## Equality filter

The generic metadata `where(...)` helper creates an equality filter.

```ts
const response = await d2.programModule.programRule
  .where({
    attribute: 'program.id' as any,
    value: 'PROGRAM_UID',
  })
  .get();
```

## Nesting relations with `with(...)`

```ts
const response = await d2.programModule.program
  .select(['id', 'name'])
  .byId('PROGRAM_UID')
  .with(
    d2.programModule.programStage
      .select(['id', 'name', 'repeatable'])
      .with(
        d2.programModule.programStageDataElement.with(
          d2.dataElementModule.dataElement.select([
            'id',
            'code',
            'name',
            'valueType',
          ]),
          'ToOne'
        )
      )
  )
  .get();
```

## Relationship direction

`with(...)` accepts either:

- `'ToMany'` (default)
- `'ToOne'`

Use `'ToOne'` when the nested object is singular.

```ts
.with(
  d2.dataElementModule.dataElement.select(['id', 'name']),
  'ToOne'
)
```

## Inspecting the generated URL

```ts
const query = d2.programModule.program
  .select(['id', 'name'])
  .byId('PROGRAM_UID');

console.log(query.dhisUrl());
```

## Response type

Metadata queries return `D2Response<T>`.

```ts
const response = await d2.dataElementModule.dataElement.get();

if (response.responseStatus.isSuccess) {
  console.log(response.data);
  console.log(response.pagination);
}
```

## Good use cases

Use metadata queries for:

- program metadata
- program stages and sections
- data elements
- option sets and options
- tracked entity attributes
- program rules and variables
- system-owned metadata hierarchies

## Practical limitation

The generic metadata query helper is strongest for field selection and relation expansion. For very custom metadata filtering patterns, the current source may still require direct `httpInstance.get(...)`.
