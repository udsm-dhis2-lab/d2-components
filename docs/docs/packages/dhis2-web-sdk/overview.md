---
title: Introduction
---

# d2-web-sdk

`@iapps/d2-web-sdk` is a TypeScript-first SDK for working with DHIS2 from browser-based web applications. It sits between your application code and the DHIS2 API and gives you a more structured way to:

- Initialize a DHIS2-aware runtime
- Read app manifest, current user, and system information
- Build metadata queries with a fluent API
- Query tracker and event data with higher-level builders
- Model tracked entities and events with decorators
- Execute program-rule logic in the browser
- Use IndexedDB-backed caching for selected GET requests

The package is **framework-agnostic**. You can use it from Angular, React, or plain TypeScript as long as your code runs in the browser.

## What this documentation focuses on

This documentation provides a generic guidance for any implementation. The examples avoid application-specific assumptions and can be adapted to different domains such as surveillance, workforce systems, registries, case management, logistics, or custom workflow apps.

## Package identity

```bash
npm install @iapps/d2-web-sdk
```

## Main ideas

1. **Initialize once** with `D2Web.initialize(...)`.
2. Reuse the singleton with `D2Web.getInstance(...)`.
3. Use the runtime modules:
   - `programModule`
   - `dataElementModule`
   - `optionSetModule`
   - `trackerModule`
   - `eventModule`
   - `userModule`
   - `systemModule`
   - `engineModule`
4. Use typed models and decorators when you want a more domain-friendly developer experience.
5. Drop down to `httpInstance` when you need raw endpoints or unsupported patterns.

## Best fit

This SDK is strongest when your application needs a mixture of:

- Metadata-driven UI
- Tracker/event forms
- Typed domain models
- Reusable query builders
- Browser-side rule evaluation
- Local caching via IndexedDB

It is less suitable for server-side or SSR-first execution because the current source relies on browser globals such as `window` and `document`.
