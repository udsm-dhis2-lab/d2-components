import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { OrganisationUnitSelectorComponent } from './organisation-unit-selector.component';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [OrganisationUnitSelectorComponent],
  exports: [OrganisationUnitSelectorComponent],
})
export class OrganisationUnitSelectorModule {}
