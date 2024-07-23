import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDhis2UiModule } from '../../shared/shared.module';
import { ButtonComponent } from './button.component';

@NgModule({
  declarations: [ButtonComponent],
  exports: [ButtonComponent],
  imports: [CommonModule, SharedDhis2UiModule],
})
export class ButtonModule {}
