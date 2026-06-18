---
title: Tracker and event models
---

# Tracker and event models

The SDK treats tracker and event data as rich model instances rather than plain JSON.

## Core classes

Tracker side:

- `TrackedEntityInstance`
- `Enrollment`
- `TrackerRelationship`

Event side:

- `DHIS2Event`
- `DataValue`

Metadata side:

- `Program`
- `ProgramStage`
- `TrackedEntityAttribute`
- `DataElement`
- `OptionSet`

## Why this matters

These classes expose helpers that plain API responses do not.

Examples:

- `TrackedEntityInstance.updateDataValues(...)`
- `TrackedEntityInstance.setAttributeValue(...)`
- `TrackedEntityInstance.setProgramStageData(...)`
- `DHIS2Event.setDataValue(...)`
- `Program.trackedEntityAttributes`
- `Program.dataElements`

## Tracked entity instance

`TrackedEntityInstance` wraps:

- top-level tracked entity identifiers
- attributes
- enrollments
- latest enrollment
- related entities
- dynamically spread field values
- mutable helper methods for draft/edit flows

## Enrollment

`Enrollment` wraps:

- enrollment dates
- incident dates
- status
- events
- grouped events by program stage
- geometry

## Event

`DHIS2Event` wraps:

- event metadata
- status
- occurred and scheduled dates
- data values
- assigned user
- geometry
- helper methods for updating data values

## Program metadata

`Program` exposes derived getters that are especially useful for UI generation:

- `trackedEntityAttributes`
- `searchableTrackedEntityAttributes`
- `reservedTrackedEntityAttributes`
- `displayInListTrackedEntityAttributes`
- `dataElements`
- `displayInListDataElements`

These derived getters make the SDK practical for metadata-driven forms, line lists, and validation flows.

## Important design detail

Tracker and event draft creation depends on metadata:

- `BaseTrackerQuery.create()` fetches program metadata and builds fields
- `BaseEventQuery.create()` fetches program metadata and builds fields for the selected program stage

That means you should always set the necessary context before calling `create()`:

- tracker: program and usually org unit
- event: program, program stage, and usually org unit or enrollment context
