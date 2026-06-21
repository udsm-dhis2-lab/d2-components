---
title: Program and metadata models
---

# Program and metadata models

## `Program`

Represents a DHIS2 program and its nested metadata.

### Important static members

- `resourceName = 'programs'`
- `singularResourceName = 'program'`
- `fields = [...]`

### Important instance properties

- `programType`
- `trackedEntityType`
- `programStages`
- `programSections`
- `programTrackedEntityAttributes`
- `programRuleVariables`
- `programRules`

### Derived getters

- `trackedEntityAttributes`
- `searchableTrackedEntityAttributes`
- `reservedTrackedEntityAttributes`
- `displayInListTrackedEntityAttributes`
- `dataElements`
- `displayInListDataElements`

These getters are especially valuable for dynamic UI generation.

## `ProgramStage`

Represents a program stage.

Notable properties:

- `repeatable`
- `autoGenerateEvent`
- `preGenerateUID`
- `captureCoordinates`
- `featureType`
- `programStageSections`
- `programStageDataElements`

## `ProgramStageDataElement`

Connects a stage to a data element and adds stage-specific behavior such as reporting/display flags and future-date allowances.

## `TrackedEntityAttribute`

Represents a TEA with metadata such as:

- `valueType`
- `generated`
- `pattern`
- `unique`
- `optionSetValue`
- `optionSet`

## `DataElement`

Represents a data element with metadata such as:

- `valueType`
- `aggregationType`
- `optionSetValue`
- `optionSet`
- `programStageId`
- `allowFutureDate`
- `isProgramStageRepeatable`

## `OptionSet`, `Option`, `OptionGroup`

Used for option-driven inputs and program-rule action resolution.
