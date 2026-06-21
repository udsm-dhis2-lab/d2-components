---
title: Extensions and reusable abstractions
---

# Extensions and reusable abstractions

The SDK is flexible enough to support application-level wrappers without forcing a single architecture.

## Pattern 1: repository-style modules

Create a small layer that hides query-builder details.

```ts
import {
  D2Web,
  DataFilterCondition,
  DataQueryFilter,
  Pager,
} from '@iapps/d2-web-sdk';

export class ClientRepository {
  async searchByNationalId(program: string, orgUnit: string, nationalId: string) {
    const d2 = await D2Web.getInstance({});

    return d2.trackerModule.trackedEntity
      .setProgram(program)
      .setOrgUnit(orgUnit)
      .setOuMode('DESCENDANTS')
      .setFilters([
        new DataQueryFilter()
          .setAttribute('NATIONAL_ID_UID')
          .setCondition(DataFilterCondition.Equal)
          .setValue(nationalId),
      ])
      .setPagination(new Pager({ page: 1, pageSize: 20 }))
      .get();
  }
}
```

## Pattern 2: typed query subclasses

```ts
import {
  D2HttpClient,
  D2Web,
  D2Window,
  ModelBaseTrackerQuery,
} from '@iapps/d2-web-sdk';
import { PersonRegistration } from './person-registration.model';

export class PersonRegistrationQuery extends ModelBaseTrackerQuery<PersonRegistration> {
  constructor(httpClient: D2HttpClient) {
    super(httpClient, PersonRegistration as any);
  }

  byNationalId(value: string) {
    return this.setFilters([
      { attribute: 'NATIONAL_ID_UID', condition: 'EQ' as any, value } as any,
    ]);
  }
}

const d2 = await D2Web.getInstance({});
const query = new PersonRegistrationQuery(d2.httpInstance);
```

## Pattern 3: UI metadata adapter

Keep the SDK in a dedicated data layer and expose a UI-friendly schema.

```ts
function toFormSchema(program: Program) {
  return {
    attributes: program.trackedEntityAttributes.map((attribute) => ({
      id: attribute.id,
      code: attribute.code,
      label: attribute.formName || attribute.name,
      valueType: attribute.valueType,
      optionSet: attribute.optionSet?.options || [],
    })),
    stages: program.programStages?.map((stage) => ({
      id: stage.id,
      name: stage.name,
      dataElements: (stage.programStageDataElements || []).map((psde) => ({
        id: psde.dataElement?.id,
        label: psde.dataElement?.formName || psde.dataElement?.name,
        valueType: psde.dataElement?.valueType,
      })),
    })),
  };
}
```

## Pattern 4: rule-driven form orchestration

```ts
function evaluateRules(program: Program, values: Record<string, unknown>) {
  return new ProgramRuleEngine()
    .setRules(program.programRules || [])
    .setDataValues(values)
    .execute();
}
```

## Recommended separation

A maintainable application structure usually keeps:

- SDK models and decorators in `models/`
- query/repository logic in `data/` or `services/`
- UI adaptation in `adapters/`
- framework hooks or services in `hooks/` or Angular services
- React or Angular components free from raw DHIS2 IDs where possible
