import { Component } from '@angular/core';
import { BaseField } from '../../shared';

@Component({
  selector: 'text-field',
  templateUrl: '../../shared/htmls/base-field.component.html',
  standalone: false,
})
export class TextFieldComponent extends BaseField {}
