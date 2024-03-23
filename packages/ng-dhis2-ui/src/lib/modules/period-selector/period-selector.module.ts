import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { periodContainers } from './containers';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [...periodContainers],
  exports: [...periodContainers],
})
export class PeriodSelectorModule {}
