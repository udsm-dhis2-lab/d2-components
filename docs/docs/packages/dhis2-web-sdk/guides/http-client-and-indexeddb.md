---
title: HTTP client and IndexedDB caching
---

# HTTP client and IndexedDB caching

The runtime exposes a low-level HTTP client through:

```ts
const d2 = await D2Web.getInstance({});
const http = d2.httpInstance;
```

Use this when the SDK does not yet expose the endpoint or query pattern you need.

## Plain GET

```ts
const response = await http.get('organisationUnits.json?fields=id,name,parent');
```

## Root URL GET

Use `useRootUrl` when the request should not be prefixed with `/api`.

```ts
const response = await http.get('manifest.webapp', {
  useRootUrl: true,
});
```

## IndexedDB-backed GET

```ts
const response = await http.get(
  'organisationUnits.json?fields=id,code,name,parent',
  { useIndexDb: true }
);
```

If matching cached data is not found, the client fetches from the API and persists the result to IndexedDB.

## Data store caching

```ts
const response = await http.get(
  'dataStore/appNamespace/settings?paging=false',
  { useIndexDb: true }
);
```

The client includes special handling for data store entries so they can be saved and retrieved consistently.

## POST, PUT, PATCH, DELETE

```ts
await http.post('trackedEntityAttributes', payload);
await http.put('dataElements/UID', payload);
await http.patch('trackedEntityAttributes/UID', patch);
await http.delete('programs/UID');
```

## IndexedDB configuration

You can configure cache namespace, version, and model schema names during initialization.

```ts
await D2Web.initialize({
  indexDBConfig: {
    namespace: 'my-app-cache',
    version: 2,
    models: {
      organisationUnits: 'id,code,name,parent.id',
      dataStore: 'referenceKey,key',
    },
  },
});
```

## Default IndexedDB resources

The current source defines default cache models for resources such as:

- organisation units
- organisation unit groups
- data elements
- tracked entity attributes
- programs
- program rules
- dashboards
- visualizations
- option sets
- data store

## When to use low-level HTTP

Prefer `httpInstance` when:

- you need endpoints not wrapped by a module
- you need custom URL parameters
- you need to prototype new behavior before promoting it to a query abstraction
- you need offline-friendly lookup caching
