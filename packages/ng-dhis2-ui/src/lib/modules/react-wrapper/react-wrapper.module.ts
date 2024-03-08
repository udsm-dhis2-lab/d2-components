import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactWrapperComponent } from './react-wrapper.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ReactWrapperComponent],
  exports: [ReactWrapperComponent],
})
export class ReactWrapperModule {}
