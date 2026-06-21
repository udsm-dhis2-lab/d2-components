---
title: Export map
---

# Export map

At the package root, the SDK exports three groups:

```ts
export * from './lib/d2-web-sdk';
export * from './lib/modules';
export * from './lib/shared';
```

## Runtime exports

- `D2Web`
- `D2Window`

## Module groups

### App and environment

- `AppManifestModule`
- `UserModule`
- `SystemModule`

### Metadata

- `ProgramModule`
- `DataElementModule`
- `OptionSetModule`

### Data

- `TrackerModule`
- `EventModule`

### Engine

- `D2EngineModule`
- `ProgramRuleEngine`

## Tracker exports

Examples:

- `TrackedEntityInstance`
- `Enrollment`
- `TrackerRelationship`
- `BaseTrackerQuery`
- `ModelBaseTrackerQuery`
- `TrackedEntityDecorator`
- `AttributeFieldDecorator`
- `RelationshipFieldDecorator`

## Event exports

Examples:

- `DHIS2Event`
- `BaseEventQuery`
- `ModelBaseEventQuery`
- `EventDecorator`
- `DataElementFieldDecorator`
- `EventFieldDecorator`

## Shared exports

Examples:

- `D2WebConfig`
- `D2HttpClient`
- `Pager`
- `D2Response`
- `D2HttpResponse`
- `DataQueryFilter`
- `DataOrderCriteria`
- `QueryCondition`
- `DataFilterCondition`
- `OuMode`
- `EnrollmentStatus`
- `EventStatus`
- `OrgUnitField`
- `generateUid`

## Recommendation

When writing application code, most teams only need a small subset of exports routinely:

- `D2Web`
- metadata modules
- tracker/event query builders
- `Pager`
- `DataQueryFilter`
- decorators
- typed model classes
- `ProgramRuleEngine`
