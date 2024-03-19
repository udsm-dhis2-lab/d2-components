import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import {
  ButtonModule,
  HeaderBarModule,
  OrganisationUnitSelectorModule,
  PeriodSelectorModule,
} from '@iapps/ng-dhis2-ui';
import { routes } from './components-routes';
import { ComponentsComponent } from './components.component';

@NgModule({
  declarations: [ComponentsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderBarModule,
    ButtonModule,
    PeriodSelectorModule,
    OrganisationUnitSelectorModule,
  ],
})
export class ComponentsModule {}
