---
title: UserModule
---

# UserModule

Provides user-related accessors.

## Class

```ts
class UserModule
```

## Methods

### `currentUser(): Promise<CurrentUser | null>`

Fetches:

- `me?...fields=...`
- `me/authorization`

Then merges them into a `CurrentUser` instance.

This is the main user-facing API in the current source.

## Getter

### `user: UserQuery`

Returns a generic metadata query for `User`.

## Recommendation

Prefer `currentUser()` for most applications:

```ts
const me = await d2.userModule.currentUser();
```

Use `d2.currentUser` after initialization when you only need the bootstrap-loaded current user.

## Note on current source

The `currentUser()` method is the well-defined path in the current implementation. For generic user querying, validate the exact needs of your implementation and fall back to `httpInstance` if needed.
