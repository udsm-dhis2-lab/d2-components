import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldItemComponent } from './components/form-field-item.component';
import { FormFieldComponent } from './containers/form-field/form-field.component';
import { FormComponent } from './containers/form/form.component';
import { RepeatableFormComponent } from './containers/repeatable-form/repeatable-form.component';
import { SectionFormComponent } from './containers/section-form/section-form.component';

@NgModule({
  declarations: [
    FormFieldComponent,
    FormComponent,
    RepeatableFormComponent,
    SectionFormComponent,
    FormFieldItemComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    FormFieldComponent,
    FormComponent,
    RepeatableFormComponent,
    SectionFormComponent,
  ],
})
export class D2FormModule {}
