# DHIS2 Dashboard library

DHIS2 Dashboard is an Angular library for rendering dashboards from either the
standard DHIS2 dashboard API or a configured data-store namespace. Library
state is owned by an injectable signal facade; consuming applications do not
need NgRx.

## Installation

`npm install @iapps/d2-dashboard`

## Usage

Import the dashboard module in the root module of your application:

```ts
import { D2DashboardModule } from '@iapps/d2-dashboard';

...
...

 @NgModule({
  declarations: [AppComponent],
  imports: [
    ...
    ...
    D2DashboardModule.forRoot({
      useDataStore: true,
      dataStoreNamespace: 'datastore-dashboard',
      rootUrl: 'dashboard',
      selectionConfig: {
        allowSelectionOnStartUp: false,
        startUpPeriodType: 'Monthly',
        periodConfig: { openFuturePeriods: 1, allowDateRangeSelection: false },
      },
    }),
    ...
  ],
  providers: [],
  bootstrap: [AppComponent],
})

export class AppModule {}
```

Expose the dashboard as a lazy-loaded route:

```ts
 {
    path: 'dashboard',
    loadChildren: () =>
      import('@iapps/d2-dashboard').then((m) => m.D2DashboardModule),
  }
```

Dashboard and submenu navigation use the canonical URL shape
`<rootUrl>/ng-dashboard-view/<dashboardId>`. Existing public components,
outputs and service APIs remain compatible.

## Required peers

Consumers must provide supported Angular packages, RxJS, React 18, DHIS2 UI,
the iapps visualizer/UI/web-sdk/period packages, Angular Grid Layout, lodash and
ngx-print. See `package.json` for supported version ranges.

## Release validation

```bash
npx nx test ng-dhis2-dashboard --coverage
npx nx build ng-dhis2-dashboard
npx nx lint ng-dhis2-dashboard
```

The manual release checklist and profiling procedure are maintained in
`TESTING.md`.
