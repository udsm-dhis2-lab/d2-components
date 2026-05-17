---
title: React integration
---

# React integration

React integration usually works best with:

- A bootstrap or provider that initializes the SDK once
- Hooks that expose the runtime
- Thin repository-style modules or hooks for queries

## Simple provider

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { D2Web } from '@iapps/d2-web-sdk';

const D2Context = createContext<D2Web | null>(null);

export function D2Provider({ children }: { children: React.ReactNode }) {
  const [d2, setD2] = useState<D2Web | null>(null);

  useEffect(() => {
    D2Web.initialize({
      indexDBConfig: {
        namespace: 'react-d2-cache',
        version: 1,
        models: {},
      },
    }).then(setD2);
  }, []);

  if (!d2) return null;

  return <D2Context.Provider value={d2}>{children}</D2Context.Provider>;
}

export function useD2() {
  const value = useContext(D2Context);
  if (!value) {
    throw new Error('useD2 must be used inside D2Provider');
  }
  return value;
}
```

## Query hook example

```tsx
import { useEffect, useState } from 'react';
import { DataFilterCondition, DataQueryFilter, Pager } from '@iapps/d2-web-sdk';
import { useD2 } from './d2-provider';

export function useClients(orgUnit: string, searchText: string) {
  const d2 = useD2();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);

      const response = await d2.trackerModule.trackedEntity
        .setProgram('PROGRAM_UID')
        .setOrgUnit(orgUnit)
        .setOuMode('DESCENDANTS')
        .setFilters([new DataQueryFilter().setAttribute('SEARCHABLE_ATTRIBUTE_UID').setCondition(DataFilterCondition.Ilike).setValue(searchText)])
        .setPagination(new Pager({ page: 1, pageSize: 25 }))
        .get();

      if (active) {
        setData(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [d2, orgUnit, searchText]);

  return { data, loading };
}
```

## Typed model example

```ts
import { AttributeFieldDecorator, EnrollmentDateFieldDecorator, TrackedEntityDecorator, TrackedEntityInstance } from '@iapps/d2-web-sdk';

@TrackedEntityDecorator({
  program: 'PROGRAM_UID',
  trackedEntityType: 'TETYPE_UID',
})
export class ClientRegistration extends TrackedEntityInstance {
  @AttributeFieldDecorator('FIRST_NAME_UID')
  firstName!: string;

  @AttributeFieldDecorator('LAST_NAME_UID')
  lastName!: string;

  @EnrollmentDateFieldDecorator()
  enrollmentDate!: string;
}
```

```tsx
import { useD2 } from './d2-provider';
import { ClientRegistration } from './client-registration.model';

export function useClientDraft() {
  const d2 = useD2();

  return async (orgUnit: string) => {
    return d2.trackerModule
      .getTrackedEntityQuery(ClientRegistration as any)
      .setOrgUnit(orgUnit)
      .create();
  };
}
```

## React guidance

- Initialize once at the app edge
- Use hooks for querying and mutation orchestration
- Keep model classes outside React component files
- In Next.js or Remix, use browser-only execution paths
- Avoid relying on the SDK in SSR-rendered code paths because the current source uses browser globals
