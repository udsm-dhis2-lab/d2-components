import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { LineListTableComponent } from './line-list-table/line-list-table.component';

@NgModule({
  declarations: [LineListTableComponent],
  exports: [LineListTableComponent],
  imports: [CommonModule, SharedDhis2UiModule],
})
export class LineListModule {}
