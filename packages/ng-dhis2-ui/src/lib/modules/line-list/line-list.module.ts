import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { LineListTableComponent } from './containers/line-list.component';
import { LineListService } from './services/line-list.service';
@NgModule({
  declarations: [LineListTableComponent],
  exports: [LineListTableComponent],
  imports: [CommonModule, SharedDhis2UiModule],
  providers: [LineListService],
})
export class LineListModule {}
