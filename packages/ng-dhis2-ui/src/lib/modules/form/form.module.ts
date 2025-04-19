import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFieldItemComponent } from './components/form-field-item.component';
import { FormFieldComponent } from './containers/form-field/form-field.component';
import { FormComponent } from './containers/form/form.component';
import { RepeatableFormComponent } from './containers/repeatable-form/repeatable-form.component';
import { SectionFormComponent } from './containers/section-form/section-form.component';
import { OrganisationUnitSelectorModule } from '../organisation-unit-selector';
import { ReactWrapperModule } from '../react-wrapper/react-wrapper.component';
import { FlatFormComponent } from './containers/flat-form/flat-form.component';

@NgModule({
  declarations: [
    FormFieldComponent,
    FormComponent,
    RepeatableFormComponent,
    SectionFormComponent,
    FlatFormComponent,
    FormFieldItemComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactWrapperModule,
    OrganisationUnitSelectorModule,
  ],
  exports: [
    FormFieldComponent,
    FormComponent,
    RepeatableFormComponent,
    SectionFormComponent,
    FlatFormComponent,
  ],
})
export class D2FormModule {}
