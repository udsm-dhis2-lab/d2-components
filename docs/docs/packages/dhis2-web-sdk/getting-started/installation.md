---
title: Installation and initialization
---

# Installation and initialization

## Install

```bash
npm install @iapps/d2-web-sdk
```

## Minimal initialization

```ts
import { D2Web } from '@iapps/d2-web-sdk';

const d2 = await D2Web.initialize({});
```

This creates a singleton runtime and stores it on `window.d2Web`.

## Recommended initialization

```ts
import { D2Web } from '@iapps/d2-web-sdk';

const d2 = await D2Web.initialize({
  locale: 'en',
  indexDBConfig: {
    namespace: 'my-app-cache',
    version: 1,
    models: {},
  },
});
```

## What initialization does

At runtime, `D2Web.initialize(...)` performs these steps:

1. Stores the provided config
2. Creates an Axios instance
3. Tries to load `./manifest.webapp` from the DHIS2 application it is used
4. Derives the DHIS2 root URL from the manifest when available
5. Creates a `D2HttpClient` and `D2IndexDb` instances
6. Fetches current user information
7. Fetches system information
8. Saves the singleton instance as window object
9. Exposes it as `window.d2Web`

## Reusing the runtime

```ts
import { D2Web } from '@iapps/d2-web-sdk';

const d2 = await D2Web.getInstance({});
```

Use `getInstance(...)` in feature modules, hooks, services, or utility functions that should reuse the already-initialized runtime.

## Accessing global runtime state

```ts
const appManifest = d2.appManifest;
const currentUser = d2.currentUser;
const systemInfo = d2.systemInfo;
```

## Important runtime assumption

Tracker and event helper methods such as metadata bootstrapping depend on the global runtime being present on `window.d2Web`. That means you should initialize the SDK **before** components, hooks, or services start creating tracker or event queries.

## Browser-only note

The current implementation uses `window` and `document`. Run initialization on the client side only.

Examples:

- Angular: initialize in an app initializer
- React: initialize in a top-level provider or in a client-side bootstrap layer
- Next.js: only in client components or browser-only setup code
