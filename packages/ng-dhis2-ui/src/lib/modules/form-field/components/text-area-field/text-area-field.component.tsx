import { Component } from '@angular/core';
import { BaseFormField } from '../../directives';

@Component({
  selector: 'ng-dhis2-ui-text-area-field',
  templateUrl: '../base-field.component.html',
  standalone: false,
})
export class TextAreaFieldComponent extends BaseFormField {
  override fieldType = 'textarea';
}
