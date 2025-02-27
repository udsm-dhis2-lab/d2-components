import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { LineListTableComponent } from './line-list-table/line-list-table.component';
import { ReactWrapperModule } from '@iapps/ng-dhis2-ui';
@NgModule({
  declarations: [LineListTableComponent],
  exports: [LineListTableComponent],
  imports: [CommonModule, SharedDhis2UiModule, ReactWrapperModule,],
})
export class LineListModule {}
