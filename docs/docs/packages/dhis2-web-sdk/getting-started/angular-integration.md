---
title: Angular integration
---

# Angular integration

The SDK is browser-based, so Angular integration usually means:

- Initialize once during app startup
- Expose the runtime through a service
- Consume typed queries from feature services or components

## App initializer pattern

```ts
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { D2Web } from '@iapps/d2-web-sdk';

function initializeD2() {
  return async () => {
    await D2Web.initialize({
      indexDBConfig: {
        namespace: 'angular-d2-cache',
        version: 1,
        models: {},
      },
    });
  };
}

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeD2,
      multi: true,
    },
  ],
})
export class AppModule {}
```

## Runtime service

```ts
import { Injectable } from '@angular/core';
import { D2Web } from '@iapps/d2-web-sdk';

@Injectable({ providedIn: 'root' })
export class D2RuntimeService {
  async getD2() {
    return D2Web.getInstance({});
  }
}
```

## Feature service example

```ts
import { Injectable } from '@angular/core';
import { D2Web, DataFilterCondition, DataQueryFilter, Pager } from '@iapps/d2-web-sdk';

@Injectable({ providedIn: 'root' })
export class ClientSearchService {
  async search(orgUnit: string, nationalId: string) {
    const d2 = await D2Web.getInstance({});

    return d2.trackerModule.trackedEntity
      .setProgram('PROGRAM_UID')
      .setOrgUnit(orgUnit)
      .setOuMode('DESCENDANTS')
      .setFilters([new DataQueryFilter().setAttribute('ATTRIBUTE_UID').setCondition(DataFilterCondition.Equal).setValue(nationalId)])
      .setPagination(new Pager({ page: 1, pageSize: 20 }))
      .get();
  }
}
```

## Working with typed models in Angular

A useful pattern is to keep decorated SDK models in a small `models/` folder and keep query orchestration inside Angular services.

```ts
import { AttributeFieldDecorator, TrackedEntityDecorator, TrackedEntityInstance } from '@iapps/d2-web-sdk';

@TrackedEntityDecorator({
  program: 'PROGRAM_UID',
  trackedEntityType: 'TETYPE_UID',
})
export class ClientRegistration extends TrackedEntityInstance {
  @AttributeFieldDecorator('FIRST_NAME_UID')
  firstName!: string;

  @AttributeFieldDecorator('LAST_NAME_UID')
  lastName!: string;
}
```

```ts
import { Injectable } from '@angular/core';
import { D2Web } from '@iapps/d2-web-sdk';
import { ClientRegistration } from './client-registration.model';

@Injectable({ providedIn: 'root' })
export class ClientRegistrationService {
  async createDraft(orgUnit: string) {
    const d2 = await D2Web.getInstance({});

    return d2.trackerModule
      .getTrackedEntityQuery(ClientRegistration as any)
      .setOrgUnit(orgUnit)
      .create();
  }
}
```

## Angular guidance

- Initialize in `APP_INITIALIZER` or `provideAppInitializer`
- Keep decorated models independent from Angular decorators
- Put transport/query logic in services
- Re-fetch after save when the UI needs fresh server state
- Avoid using the SDK during SSR
