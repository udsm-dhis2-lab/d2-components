import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSelectionFiltersComponent } from './dashboard-selection-filters.component';
import { d2DashboardMaterialModules } from '../../shared';
import { d2DashboardSelectionFilterDialogs } from './dialogs';
import { NgxDhis2OrgUnitFilterModule } from '@iapps/ngx-dhis2-org-unit-filter';
import { NgxDhis2PeriodFilterModule } from '@iapps/ngx-dhis2-period-filter';
import { dashboardSelectionFilterServices } from './services';
import { OrganisationUnitSelectorModule } from '@iapps/ng-dhis2-ui';

@NgModule({
  imports: [
    CommonModule,
    ...d2DashboardMaterialModules,
    ...d2DashboardMaterialModules,
    NgxDhis2OrgUnitFilterModule,
    NgxDhis2PeriodFilterModule,
    OrganisationUnitSelectorModule,
  ],
  declarations: [
    DashboardSelectionFiltersComponent,
    ...d2DashboardSelectionFilterDialogs,
  ],
  providers: [...dashboardSelectionFilterServices],
  exports: [DashboardSelectionFiltersComponent],
})
export class DashboardSelectionFiltersModule {}
