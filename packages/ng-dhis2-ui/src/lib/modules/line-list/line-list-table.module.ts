import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { LineListTableComponent } from './containers/line-list.component';
import { ReactWrapperModule } from '../../modules/react-wrapper';
import { LineListService } from './services/line-list.service';
@NgModule({
  declarations: [LineListTableComponent],
  exports: [LineListTableComponent],
  imports: [CommonModule, SharedDhis2UiModule, ReactWrapperModule],
  providers: [LineListService],
})
export class LineListModule {}
