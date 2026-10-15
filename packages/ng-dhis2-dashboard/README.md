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

Dashboard visualization content is viewport-activated. Lightweight grid shells preserve
layout and scroll extent, while configuration and analytics begin only when an
item enters the browser viewport or its 200px vertical prefetch margin. Items
remain active for the displayed dashboard so scrolling back does not refetch.
Browsers without `IntersectionObserver` retain eager rendering.

Dashboard layout responds to the width of its containing element rather than
only the browser viewport. Containers at least 960px wide preserve the authored
60-column DHIS2 layout. Widths from 600px to 959px use a collision-free
12-column compact layout with a four-column minimum item span. Below 600px,
items follow their top-to-bottom, left-to-right reading order in one full-width
column. Responsive layouts are derived from, and never mutate, the canonical
dashboard coordinates.

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
