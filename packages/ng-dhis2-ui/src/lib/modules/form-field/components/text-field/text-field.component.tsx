import { Component } from '@angular/core';
import { BaseFormField } from '../../directives';

@Component({
  selector: 'ng-dhis2-ui-text-field',
  templateUrl: '../base-field.component.html',
  standalone: false,
})
export class TextFieldComponent extends BaseFormField {}
