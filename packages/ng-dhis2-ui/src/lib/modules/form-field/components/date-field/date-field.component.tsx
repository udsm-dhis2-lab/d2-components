import { Component } from '@angular/core';
import { BaseFormField } from '../../directives';

@Component({
  selector: 'ng-dhis2-ui-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  standalone: false,
})
export class DateFieldComponent extends BaseFormField {}
