import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { PeriodSelectorComponent } from './period-selector.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [PeriodSelectorComponent],
  exports: [PeriodSelectorComponent],
})
export class PeriodSelectorModule {}
