---
title: Decorators and typed models
---

# Decorators and typed models

Decorators let you map application-friendly property names to DHIS2 attribute IDs, data element IDs, enrollment dates, event IDs, relationships, and org units.

This is one of the most useful parts of the SDK when you want your application code to talk in domain terms rather than DHIS2 IDs.

## Tracker model example

```ts
import {
  AttributeFieldDecorator,
  EnrollmentDateFieldDecorator,
  OrgUnitField,
  TrackedEntityDecorator,
  TrackedEntityIdFieldDecorator,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';

@TrackedEntityDecorator({
  program: 'PROGRAM_UID',
  trackedEntityType: 'TETYPE_UID',
})
export class PersonRegistration extends TrackedEntityInstance {
  @TrackedEntityIdFieldDecorator()
  id!: string;

  @AttributeFieldDecorator('FIRST_NAME_UID')
  firstName!: string;

  @AttributeFieldDecorator('LAST_NAME_UID')
  lastName!: string;

  @EnrollmentDateFieldDecorator()
  enrollmentDate!: string;

  @OrgUnitField()
  orgUnit!: string;
}
```

## Event model example

```ts
import {
  DataElementFieldDecorator,
  EventDateFieldDecorator,
  EventDecorator,
  EventIdFieldDecorator,
  DHIS2Event,
} from '@iapps/d2-web-sdk';

@EventDecorator({
  programStage: 'STAGE_UID',
})
export class FollowUpVisit extends DHIS2Event {
  @EventIdFieldDecorator()
  id!: string;

  @EventDateFieldDecorator()
  eventDate!: string;

  @DataElementFieldDecorator('TEMPERATURE_UID')
  temperature!: string;

  @DataElementFieldDecorator('OUTCOME_UID')
  outcome!: string;
}
```

## What decorators do

At a high level, decorators:

- keep field mappings close to the model definition
- update internal SDK structures such as `fields`, attributes, and data values
- make creation and editing code easier to read
- support typed query builders such as `getTrackedEntityQuery(...)` and `getEventQuery(...)`

## When to use decorators

Decorators are ideal when:

- the same tracker or event structure appears repeatedly
- you want reusable model classes across forms, tables, and workflows
- you want strongly named properties in TypeScript
- you need a consistent place for field mappings

## When not to use decorators

Direct model mutation or direct `updateDataValues(...)` may be simpler when:

- the form is fully dynamic
- the metadata is unknown at compile time
- a screen builds fields entirely from metadata at runtime

## Recommendation

Use decorators for stable domain models, and use metadata-driven mutation helpers for dynamic forms.
