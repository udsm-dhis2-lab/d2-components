---
title: Runtime and entry point
---

# Runtime and entry point

## `D2Web`

Main browser runtime and module factory.

### Static methods

#### `D2Web.initialize(config: D2WebConfig): Promise<D2Web>`

Creates the singleton runtime, loads manifest/current user/system info, and attaches the instance to `window.d2Web`.

#### `D2Web.getInstance(config: D2WebConfig): Promise<D2Web>`

Returns the existing singleton or initializes it if needed.

### Instance properties

- `httpInstance: D2HttpClient`
- `appManifest: Manifest | null`
- `currentUser: CurrentUser | null`
- `systemInfo: SystemInfo | null`
- `config: D2WebConfig`

### Module getters

- `userModule: UserModule`
- `systemModule: SystemModule`
- `programModule: ProgramModule`
- `dataElementModule: DataElementModule`
- `optionSetModule: OptionSetModule`
- `engineModule: D2EngineModule`
- `eventModule: EventModule`
- `trackerModule: TrackerModule`

### Other public methods

- `setConfig(config)`
- `setAppManifest(axiosInstance)`
- `setCurrentUser()`
- `setSystemInfo()`
- `setHttpInstance(axiosInstance, indexDb)`

### Getter

#### `rootUrl`

Returns the DHIS2 root URL from the manifest when available, otherwise falls back to `../../..`.

## `D2WebConfig`

Configuration model used during initialization.

### Properties

- `baseUrl?: string`
- `locale?: string`
- `httpClientConfig?: Partial<AxiosDefaults>`
- `indexDBConfig?: ID2IndexDbConfig`

## `D2Window`

Utility type representing:

```ts
interface D2Window extends Window {
  d2Web: D2Web;
}
```

Useful when reading the singleton from browser global state.

```ts
const d2 = (window as unknown as D2Window).d2Web;
```

## Practical guidance

Use direct access to `window.d2Web` sparingly. In most applications, it is better to wrap the runtime in:

- an Angular service
- a React context/hook
- a small runtime provider module
