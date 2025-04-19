import { Component } from '@angular/core';
import { BaseFormFieldComponent } from './base-form-field.component';

@Component({
  selector: 'ng-dhis2-ui-form-field-item',
  template: `<ng-content></ng-content>`,
  standalone: false,
})
export class FormFieldItemComponent extends BaseFormFieldComponent {}
