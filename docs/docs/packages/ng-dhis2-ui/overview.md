---
title: ng-dhis2-ui
---

# @iapps/ng-dhis2-ui

Angular wrapper library for React-based DHIS2 UI components in DHIS2 platform applications.

## Install

```bash
npm install @iapps/ng-dhis2-ui
```

## TypeScript configuration

Because the package wraps React components, Angular applications should enable JSX and React interop in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true
  }
}
```

## Build from source

```bash
npm run build:ng-dhis2-ui
```

## What to document next

- Component catalog
- Module imports
- Theming and DHIS2 UI integration
- Examples using `@iapps/ngx-dhis2-http-client`
