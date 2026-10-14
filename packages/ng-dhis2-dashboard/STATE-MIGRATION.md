# Dashboard signal state

## Architecture

`DashboardStateFacade` is the single owner of dashboard application state. It
is provided by `D2DashboardModule` and exported from the library entry point.

| Concern | Owned state | Derived state |
| --- | --- | --- |
| Menus | Menu list and selected IDs | Selected menu and submenu |
| Dashboards | Dashboard record and active ID | Active dashboard |
| Selections | Startup and per-dashboard selections | Active selection and filters |
| Requests | Menu/dashboard loading and errors | Presentation-specific status |

Writable state is private. Consumers receive readonly signals and modify state
through explicit facade commands. Record and nested status updates are
immutable.

## Consumer responsibilities

- `DashboardMenuService` owns menu HTTP and navigation side effects. It writes
  results to the facade and exposes compatibility signals derived from it.
- `DashboardService` owns dashboard HTTP, overlays, snackbars and the existing
  navigation API. It initializes startup selections and writes dashboard
  success/failure transitions to the facade.
- `CurrentDashboardComponent` renders facade signals directly. Its only RxJS
  pipeline switches dashboard HTTP requests when the active ID changes and is
  bound to its `DestroyRef` with `takeUntilDestroyed`.

There is no compatibility synchronization layer and no secondary state owner.

## Initialization lifecycle

1. Importing `D2DashboardModule.forRoot(config)` provides one facade for that
   module injector.
2. `DashboardMenuService.load()` starts menu loading, resolves authorization
   and route selection, stores the menus, then performs the established route
   navigation.
3. `DashboardService` derives startup selections from configuration.
4. Active-dashboard changes trigger the container's cancellable HTTP switch.
5. Dashboard-specific selection configuration replaces startup selections for
   that dashboard; otherwise the configured startup selection is used.
6. Filter commands replace only the addressed dashboard's selection.

## Public compatibility

Existing dashboard routes, component outputs, menu-service signals,
`DashboardService.currentDashboardId`, `currentDashboardId$`, and
`getCurrentDashboardId()` remain available. The signal facade is an additive
public API and exposes no NgRx types.

## Removed in Sprint 03

- Dashboard selection and menu actions.
- Dashboard and dashboard-selection reducers.
- Selection selectors and initialization effect.
- Store/effects barrel files and feature registration.
- Store/effects Storybook registration.
- Store injection from services and containers.
- `DashboardService`'s state `BehaviorSubject`.
- `DashboardMenuService`'s private writable menu signal.

Source and built-output searches contain no `@ngrx`, `StoreModule`,
`EffectsModule`, NgRx action, selector, reducer or feature references. The
published package manifest has no NgRx dependency.

## Migration and compatibility

Applications importing the library do not register an NgRx feature store. The
existing module, routes, component outputs and service accessors remain
available; signal state is additive. No consumer-side migration is required
unless an application imported private NgRx implementation files, which were
never part of the supported entry point.

## Sprint 03 validation baseline

Coverage is 90.57% statements, 68.04% branches, 91.79% functions and 90.09%
lines. The enforced floors remain 85%, 60%, 85% and 85%.
