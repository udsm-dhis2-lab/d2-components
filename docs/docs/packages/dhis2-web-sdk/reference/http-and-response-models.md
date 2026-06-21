---
title: HTTP and response models
---

# HTTP and response models

## `D2HttpClient`

Low-level browser HTTP client used by the runtime.

### Methods

- `get(url, config?)`
- `post(url, data, config?)`
- `put(url, data, config?)`
- `patch(url, data, config?)`
- `delete(url, config?)`

### Request config

`get(...)` supports options such as:

- `useRootUrl`
- `useIndexDb`

The request config type also includes fields such as `httpHeaders`, `indexDbConfig`, and flags for standardization/version behavior.

## `D2HttpResponseStatus`

Represents request status.

### Properties

- `status`
- `statusText`
- `message?`

### Getter

- `isSuccess`

## `D2HttpResponse`

Wraps raw HTTP responses and normalizes success and error status.

## `D2Response<T>`

Used by metadata query builders.

### Properties

- `data?: T | T[]`
- `pagination?: Pager`
- `responseStatus: D2HttpResponseStatus`

## `D2TrackerResponse<T>`

Used by tracker query builders.

### Properties

- `data?: T | T[]`
- `pagination?: Pager`
- `responseStatus: D2HttpResponseStatus`

## `D2EventResponse<T>`

Used by event query builders.

### Properties

- `data?: T | T[]`
- `pagination?: Pager`
- `responseStatus: D2HttpResponseStatus`

## Practical guidance

Because save operations go through tracker import APIs, a successful save response is not always the same thing as a freshly hydrated entity. A robust UI flow is:

1. mutate model
2. save
3. inspect `responseStatus`
4. re-fetch authoritative server state if needed
