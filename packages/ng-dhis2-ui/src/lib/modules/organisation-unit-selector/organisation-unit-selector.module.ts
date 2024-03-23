import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { OrganisationUnitSelectorComponent } from './containers/organisation-unit-selector/organisation-unit-selector.component';
import { OrganisationUnitSelectorModalComponent } from './containers/organisation-unit-selector-modal/organisation-unit-selector-modal.component-modal';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [
    OrganisationUnitSelectorComponent,
    OrganisationUnitSelectorModalComponent,
  ],
  exports: [
    OrganisationUnitSelectorComponent,
    OrganisationUnitSelectorModalComponent,
  ],
})
export class OrganisationUnitSelectorModule {}
