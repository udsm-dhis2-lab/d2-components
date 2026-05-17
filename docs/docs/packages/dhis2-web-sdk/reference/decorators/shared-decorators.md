---
title: Shared decorators
---

# Shared decorators

## `OrgUnitField(options?)`

Maps a property to a tracked entity org unit.

```ts
@OrgUnitField()
orgUnit!: string;
```

If `useName` is true, the getter returns the enrollment org unit name instead of the UID.

```ts
@OrgUnitField({ useName: true })
orgUnitName!: string;
```

This is useful for display-oriented model properties.
