import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { organisationUnitSelectorContainers } from './containers';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [...organisationUnitSelectorContainers],
  exports: [...organisationUnitSelectorContainers],
})
export class OrganisationUnitSelectorModule {}
