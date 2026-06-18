---
title: Event decorators
---

# Event decorators

## `EventDecorator({ programStage })`

Class decorator that sets the model's `programStage`.

```ts
@EventDecorator({ programStage: 'STAGE_UID' })
class FollowUpVisit extends DHIS2Event {}
```

## `EventIdFieldDecorator()`

Property decorator for `event`.

```ts
@EventIdFieldDecorator()
id!: string;
```

## `EventDateFieldDecorator()`

Property decorator for event date / occurred date.

```ts
@EventDateFieldDecorator()
eventDate!: string;
```

## `DataElementFieldDecorator(dataElement, programStage?, fromTracker = false)`

Maps a property to a data element.

### Direct event usage

```ts
@DataElementFieldDecorator('RESULT_UID')
result!: string;
```

### Tracker-backed stage field usage

When `fromTracker` is `true`, the decorator reads and writes through the tracked entity's latest enrollment and stage events.

```ts
@DataElementFieldDecorator('RESULT_UID', 'STAGE_UID', true)
result!: string;
```

## `EventFieldDecorator(programStage, EventClass?, multiple?)`

Maps a tracked entity property to one or more stage events.

```ts
@EventFieldDecorator('STAGE_UID', FollowUpVisit)
followUp!: FollowUpVisit;
```

or:

```ts
@EventFieldDecorator('STAGE_UID', FollowUpVisit, true)
followUps!: FollowUpVisit[];
```

Assigning the event automatically aligns:

- `programStage`
- `program`
- `enrollment`
- `orgUnit`
- `trackedEntity`
