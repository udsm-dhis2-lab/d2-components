---
title: AppManifestModule
---

# AppManifestModule

Loads the local `manifest.webapp`.

## Class

```ts
class AppManifestModule
```

## Constructor

```ts
new AppManifestModule(axiosInstance)
```

## Method

### `get(): Promise<Manifest | null>`

Attempts to fetch `./manifest.webapp`.

Returns:

- `Manifest` when the file exists and can be parsed
- `null` when the file cannot be loaded

## Typical usage

You normally do not instantiate this module directly because `D2Web.initialize(...)` already uses it internally. The main reason to care about it is understanding how the runtime discovers the DHIS2 root URL through:

```ts
manifest.activities.dhis.href
```
