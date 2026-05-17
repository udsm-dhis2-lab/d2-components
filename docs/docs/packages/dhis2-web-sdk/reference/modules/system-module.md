---
title: SystemModule
---

# SystemModule

Provides access to DHIS2 system information.

## Class

```ts
class SystemModule
```

## Method

### `getSystemInfo(): Promise<SystemInfo | null>`

Calls:

```text
system/info
```

and returns a `SystemInfo` model.

## Typical usage

```ts
const systemInfo = await d2.systemModule.getSystemInfo();

if (systemInfo) {
  console.log(systemInfo.version);
  console.log(systemInfo.baseUrl);
  console.log(systemInfo.apiVersion);
}
```

## Common use cases

- detect server version
- derive base URL or init configuration
- display environment information
- debug host/runtime differences between environments
