import { Component } from '@angular/core';
import { BaseField } from '../../shared';

@Component({
  selector: 'date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  standalone: false,
})
export class DateFieldComponent extends BaseField {}
