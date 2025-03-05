import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { ReactWrapperModule } from '../react-wrapper';
import { DataTableUIComponent } from './containers/data-table-ui/data-table-ui.component';
@NgModule({
  declarations: [DataTableUIComponent],
  exports: [DataTableUIComponent],
  imports: [CommonModule, SharedDhis2UiModule, ReactWrapperModule],
  providers: [],
})
export class DataTableUIModule {}
