import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { PeriodSelectorModalComponent } from './containers/period-selector-modal/period-selector-modal.component';
import { PeriodSelectorComponent } from './containers/period-selector/period-selector.component';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [PeriodSelectorComponent, PeriodSelectorModalComponent],
  exports: [PeriodSelectorComponent, PeriodSelectorModalComponent],
})
export class PeriodSelectorModule {}
