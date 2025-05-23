import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionFiltersComponent } from './containers/selection-filters-ui/selection-filters-ui.component';

import { SharedDhis2UiModule } from '../../shared/shared.module';
import { ReactWrapperModule } from '../react-wrapper/react-wrapper.component';
import { OrganisationUnitSelectorModule } from '../organisation-unit-selector';

@NgModule({
  declarations: [SelectionFiltersComponent],
  imports: [CommonModule, SharedDhis2UiModule, ReactWrapperModule, OrganisationUnitSelectorModule],
  exports: [SelectionFiltersComponent],
})
export class SelectionFiltersUiModule {}
