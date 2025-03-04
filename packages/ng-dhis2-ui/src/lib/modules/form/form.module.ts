import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldModule } from '../form-field';
import { formComponents } from './components';

@NgModule({
  declarations: [...formComponents],
  imports: [CommonModule, ReactiveFormsModule, FormFieldModule],
  exports: [...formComponents],
})
export class FormModule {}
