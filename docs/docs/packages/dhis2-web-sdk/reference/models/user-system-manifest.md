---
title: User, SystemInfo, and Manifest
---

# User, SystemInfo, and Manifest

## `CurrentUser`

Extends `User` and adds:

- `authorities: string[]`

Useful for feature access, menu filtering, and conditional UI rendering.

## `SystemInfo`

Represents data from `system/info`.

### Helpful getters

#### `baseUrl`

Returns a browser-derived base URL on localhost and otherwise uses `contextPath`.

#### `apiVersion`

Derives the API version from the DHIS2 version string.

#### `toInitObject()`

Returns:

```ts
{
  baseUrl,
  apiVersion,
}
```

## `Manifest`

Represents `manifest.webapp`.

Important fields include:

- `name`
- `version`
- `description`
- `launch_path`
- `appType`
- `icons`
- `developer`
- `default_locale`
- `activities.dhis.href`
- `authorities`

The runtime uses `activities.dhis.href` to determine the DHIS2 root URL when the manifest is present.
