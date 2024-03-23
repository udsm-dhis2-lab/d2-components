import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  ButtonModule,
  HeaderBarModule,
  OrganisationUnitSelectorModule,
  PeriodSelectorModule,
  ReactWrapperModule,
} from '@iapps/ng-dhis2-ui';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { NxWelcomeComponent } from './nx-welcome.component';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';
import { D2DashboardModule } from '@iapps/d2-dashboard';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppShellModule } from '@iapps/ng-dhis2-shell';
import { AppComponentWrapper } from './app.component.wrapper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
      useDataStore: false,
      dataStoreNamespace: 'afyamsafiri-dashboard',
      rootUrl: 'dashboard',
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
