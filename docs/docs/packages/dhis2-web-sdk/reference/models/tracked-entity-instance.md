---
title: TrackedEntityInstance
---

# TrackedEntityInstance

`TrackedEntityInstance` is the central mutable model for tracker workflows.

## Core data

- tracked entity identity
- tracked entity type
- org unit
- attributes
- enrollments
- latest enrollment
- related entities

## Important getters

### `attributeEntities`

Returns attribute values mapped by attribute IDs.

### `dataEntities`

Currently mirrors `attributeEntities`.

### `reportEntities`

Returns a compact reporting object that includes:

- `orgUnit`
- `orgUnitName`
- `enrollmentDate`
- `incidentDate`

## Important methods

### Mutation helpers

- `setOrgUnit(orgUnit, updateTeiOrgUnit?)`
- `setAttributeValue(attribute, value, code?)`
- `setEnrollment(enrollment)`
- `setEnrollmentDate(enrollmentDate)`
- `setIncidentDate(incidentDate)`
- `setEnrollmentGeometry(coordinateValue)`
- `setRelationship(relationship)`
- `setEvent(event)`
- `setProgramStageData(programStage, data)`
- `setDataValue(dataElement, value, programStage, eventId?)`
- `updateDataValues(dataValueEntities, updateTeiOrgUnit?)`
- `setFields(program)`

### Lookup helpers

- `getAttributeValue(attribute)`
- `getEventByStage(programStage)`
- `getEventsByProgramStage(programStage)`
- `getRelatedEntitiesByType(relationshipType)`

### Lifecycle helpers

- `complete()`
- `toReadable(attributeName, attributeType)`
- `toObject(options?)`
- `toTrackedEntity()`

## `updateDataValues(...)`

This is one of the most useful methods for forms.

```ts
instance.updateDataValues({
  firstName: 'Asha',
  lastName: 'Khalid',
  enrollmentDate: '2026-04-01',
  orgUnit: 'ORG_UNIT_UID',
});
```

The method uses the internal `fields` map to decide whether each property maps to:

- a tracked entity attribute
- a data element
- enrollment date
- incident date
- org unit
- geometry

## `toObject(...)`

Produces the tracker payload used when saving through the tracker import endpoint.

```ts
const payload = instance.toObject();
```

## Relationship support

`relatedEntities` stores normalized `TrackerRelationship` objects, which can be added directly or through `RelationshipFieldDecorator`.
