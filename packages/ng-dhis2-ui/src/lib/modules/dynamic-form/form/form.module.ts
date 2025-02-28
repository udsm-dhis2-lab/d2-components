import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReactWrapperModule } from '@iapps/ng-dhis2-ui';
import { formPipes } from './pipes';
import { CommonModule } from '@angular/common';
import { fieldComponents } from './components';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker } from '@angular/material/datepicker';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PipesModule,
    MatFormFieldModule,
    MatDatepicker,
    ReactWrapperModule,
    // TranslateModule,
  ],
  declarations: [...fieldComponents, ...formPipes],
  providers: [],
  exports: [...fieldComponents, ...formPipes],
})
export class FormModule {}
