# DHIS2 Dashboard library

This library was generated with [Nx](https://nx.dev).
DHIS2 Dashboard is angular library that support dashboard visualization both using default dashboard APIs or custom dashboard managed from datastore. It is intended to get incorporated in any DHIS2 angular application where dashboard is to be one of application page

## Installation

`npm install @iapps/d2-dashboard`

## Usage

Import dashboard module in the root module of your application

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

Then, you can use dashboard module as a lazy loaded route

```ts
 {
    path: 'dashboard',
    loadChildren: () =>
      import('@iapps/d2-dashboard').then((m) => m.D2DashboardModule),
  }
```
