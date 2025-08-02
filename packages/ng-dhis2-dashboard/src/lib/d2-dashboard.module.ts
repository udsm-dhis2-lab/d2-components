import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { ReactWrapperModule } from '@iapps/ng-dhis2-ui';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgxPrintModule } from 'ngx-print';
import {
  d2DashboardComponents,
  d2DashboardEntryComponents,
} from './components';
import { d2DashboardContainers } from './containers';
import { D2DashboardRoutingModule } from './d2-dashboard-routing.module';
import { DashboardConfig } from './models';
import { d2DashboardPipes } from './pipes';
import { d2DashboardServices } from './services';
import { DASHBOARD_CONFIG } from './services/dashboard-config.service';
import { d2DashboardMaterialModules } from './shared';
import {
  d2DashboardEffects,
  d2DashboardFeature,
  d2DashboardSelectionFeature,
} from './store';

@NgModule({
  imports: [
    CommonModule,
    D2DashboardRoutingModule,
    KtdGridModule,
    NgxPrintModule,
    ReactWrapperModule,
    ...d2DashboardMaterialModules,
    StoreModule.forFeature(d2DashboardFeature),
    StoreModule.forFeature(d2DashboardSelectionFeature),
    EffectsModule.forFeature(d2DashboardEffects),
  ],
  declarations: [
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
  exports: [],
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
