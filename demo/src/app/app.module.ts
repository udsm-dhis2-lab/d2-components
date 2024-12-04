import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { D2DashboardModule } from '@iapps/d2-dashboard';
import { AppShellModule } from '@iapps/ng-dhis2-shell';
import { ReactWrapperModule } from '@iapps/ng-dhis2-ui';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app.component';
import { AppComponentWrapper } from './app.component.wrapper';
import { appRoutes } from './app.routes';

@NgModule({
  declarations: [AppComponent, AppComponentWrapper],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactWrapperModule,
    AppShellModule.forRoot({
      pwaEnabled: false,
      isDevMode: true,
    }),
    RouterModule.forRoot(appRoutes, {
      useHash: true,
    }),
    NgxDhis2HttpClientModule.forRoot({
      version: 1,
      models: {},
      namespace: '',
    }),
    D2DashboardModule.forRoot({
      rootUrl: 'dashboard',
      useDataStore: true,
      dataStoreNamespace: 'afyamsafiri-dashboard',
      selectionConfig: {
        allowSelectionOnStartUp: false,
        startUpPeriodType: 'Monthly',
        periodConfig: { openFuturePeriods: 1, allowDateRangeSelection: false },
      },
    }),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
  ],
  providers: [],
  bootstrap: [AppComponentWrapper],
})
export class AppModule {}
