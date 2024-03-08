import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { HeaderBarComponent } from './header-bar.component';

@NgModule({
  imports: [CommonModule, SharedDhis2UiModule],
  declarations: [HeaderBarComponent],
  exports: [HeaderBarComponent],
})
export class HeaderBarModule {}
