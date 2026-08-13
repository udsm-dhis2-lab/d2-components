---
title: Tracker decorators
---

# Tracker decorators

## `TrackedEntityDecorator(...)`

Class decorator.

```ts
@TrackedEntityDecorator({
  program: 'PROGRAM_UID',
  trackedEntityType: 'TETYPE_UID',
})
class ClientRegistration extends TrackedEntityInstance {}
```

Sets:

- `prototype.program`
- `prototype.trackedEntityType`

## `AttributeFieldDecorator(attributeId, generated?)`

Property decorator that maps a property to a tracked entity attribute.

```ts
@AttributeFieldDecorator('FIRST_NAME_UID')
firstName!: string;
```

When assigned, it updates:

- `instance.fields`
- tracked entity attributes through `setAttributeValue(...)`

## `EnrollmentDateFieldDecorator()`

Property decorator for enrollment date.

```ts
@EnrollmentDateFieldDecorator()
enrollmentDate!: string;
```

## `TrackedEntityIdFieldDecorator()`

Property decorator for tracked entity ID.

```ts
@TrackedEntityIdFieldDecorator()
id!: string;
```

Assigning a value updates both:

- `trackedEntity`
- `trackedEntityInstance`

## `RelationshipFieldDecorator(relationshipType, RelationshipClass?, multiple?)`

Maps a property to tracker relationships.

```ts
@RelationshipFieldDecorator('RELATIONSHIP_TYPE_UID')
guardian!: TrackerRelationship;
```

Can optionally hydrate related records into:

- another `TrackedEntityInstance` subclass
- an event class

## Typical pattern

```ts
@TrackedEntityDecorator({
  program: 'PROGRAM_UID',
  trackedEntityType: 'TETYPE_UID',
})
class HouseholdMember extends TrackedEntityInstance {
  @TrackedEntityIdFieldDecorator()
  id!: string;

  @AttributeFieldDecorator('FIRST_NAME_UID')
  firstName!: string;

  @EnrollmentDateFieldDecorator()
  enrollmentDate!: string;
}
```
