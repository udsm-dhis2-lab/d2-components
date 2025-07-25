import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import {
  ButtonModule,
  HeaderBarModule,
  LineListModule,
  DataTableUIModule,
  OrganisationUnitSelectorModule,
  PeriodSelectorModule,
  SelectionFiltersUiModule,
  D2FormModule,
  BreadcrumbModule,
  ProgramEntryFormModule,
} from '@iapps/ng-dhis2-ui';
import { routes } from './components-routes';
import { ComponentsComponent } from './components.component';
import { NgxDhis2DictionaryModule } from '@iapps/ngx-dhis2-dictionary';

@NgModule({
  declarations: [ComponentsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderBarModule,
    ButtonModule,
    PeriodSelectorModule,
    BreadcrumbModule,
    OrganisationUnitSelectorModule,
    NgxDhis2DictionaryModule,
    LineListModule,
    DataTableUIModule,
    SelectionFiltersUiModule,
    D2FormModule,
    ProgramEntryFormModule,
  ],
})
export class ComponentsModule {}
