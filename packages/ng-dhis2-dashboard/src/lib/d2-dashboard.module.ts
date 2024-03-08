import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import {
  d2DashboardComponents,
  d2DashboardEntryComponents,
} from './components';
import { d2DashboardContainers } from './containers';
import { D2DashboardRoutingModule } from './d2-dashboard-routing.module';
import { D2DashboardComponent } from './d2-dashboard.component';
import { DashboardConfig } from './models';
import { d2DashboardModules } from './modules';
import { d2DashboardPipes } from './pipes';
import { d2DashboardServices } from './services';
import { DASHBOARD_CONFIG } from './services/dashboard-config.service';
import { d2DashboardMaterialModules } from './shared';
import { NgxPrintModule } from 'ngx-print';
import { StoreModule } from '@ngrx/store';
import {
  d2DashboardEffects,
  d2DashboardFeature,
  d2DashboardMenuFeature,
  d2DashboardSelectionFeature,
} from './store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  imports: [
    CommonModule,
    D2DashboardRoutingModule,
    NgxDhis2HttpClientModule,
    KtdGridModule,
    NgxPrintModule,
    ...d2DashboardMaterialModules,
    ...d2DashboardModules,
    StoreModule.forFeature(d2DashboardMenuFeature),
    StoreModule.forFeature(d2DashboardFeature),
    StoreModule.forFeature(d2DashboardSelectionFeature),
    EffectsModule.forFeature(d2DashboardEffects),
  ],
  declarations: [
    D2DashboardComponent,
    ...d2DashboardContainers,
    ...d2DashboardComponents,
    ...d2DashboardEntryComponents,
    ...d2DashboardPipes,
  ],
  providers: [
    ...d2DashboardServices,
    {
      provide: MatSnackBarRef,
      useValue: {},
    },
  ],
  exports: [D2DashboardComponent],
})
export class D2DashboardModule {
  static forRoot(
    config: DashboardConfig
  ): ModuleWithProviders<D2DashboardModule> {
    return {
      ngModule: D2DashboardModule,
      providers: [
        {
          provide: DASHBOARD_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
