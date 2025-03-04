import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { formFieldContainers } from './containers';
import { formFieldComponents } from './components';

@NgModule({
  declarations: [...formFieldContainers, ...formFieldComponents],
  imports: [CommonModule],
  exports: [...formFieldContainers],
})
export class FormFieldModule {}
