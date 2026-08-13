---
title: Working with events
---

# Working with events

Use `eventModule` when your workflow is event-centric.

## Basic event search

```ts
const response = await d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setOuMode('DESCENDANTS')
  .get();
```

## Filter by data element

```ts
const response = await d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setFilters([
    new DataQueryFilter()
      .setAttribute('RESULT_UID')
      .setCondition(DataFilterCondition.In)
      .setValue(['QUALIFIED', 'REFERRED'])
      .setType('DATA_ELEMENT'),
  ])
  .get();
```

## Filter by tracked entity attribute

Event queries support attribute filters separately.

```ts
const response = await d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setAttributeFilters([
    new DataQueryFilter()
      .setAttribute('ATTRIBUTE_UID')
      .setCondition(DataFilterCondition.Equal)
      .setValue('ABC-123'),
  ])
  .get();
```

## Date filtering

```ts
const response = await d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setStartDate('2026-04-01', 'OCCURED_ON')
  .setEndDate('2026-04-07', 'OCCURED_ON')
  .get();
```

Other supported date types:

- `'SCHEDULED_ON'`
- `'ENROLLED_ON'`

## Load a single event

```ts
const response = await d2.eventModule.event
  .setEvent('EVENT_UID')
  .get();
```

`byEventId(...)` is also available as a deprecated alias.

## Create a draft event

```ts
const event = await d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setTrackedEntity('TRACKED_ENTITY_UID')
  .setEnrollment('ENROLLMENT_UID')
  .create();
```

The draft event receives field definitions from program metadata for the selected stage.

## Update values and save

```ts
event.updateDataValues({
  eventDate: '2026-04-07',
  temperature: '38.1',
  outcome: 'REFERRED',
});

const saveResponse = await d2.eventModule.event
  .setProgram('PROGRAM_UID')
  .setProgramStage('STAGE_UID')
  .setData(event)
  .save();
```

## Typed event model

```ts
@EventDecorator({ programStage: 'STAGE_UID' })
class FollowUpVisit extends DHIS2Event {
  @EventDateFieldDecorator()
  eventDate!: string;

  @DataElementFieldDecorator('TEMPERATURE_UID')
  temperature!: string;

  @DataElementFieldDecorator('OUTCOME_UID')
  outcome!: string;
}

const query = d2.eventModule.getEventQuery(FollowUpVisit as any);
const draft = await query
  .setProgram('PROGRAM_UID')
  .setOrgUnit('ORG_UNIT_UID')
  .setTrackedEntity('TRACKED_ENTITY_UID')
  .setEnrollment('ENROLLMENT_UID')
  .create();
```

## Current source note

The URL generator supports assigned-user parameters, but `BaseEventQuery` does not currently expose public setters for `assignedUser` and `assignedUserMode`. For those cases, use direct HTTP requests or extend the query class in your application.
