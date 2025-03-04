import { Component } from '@angular/core';
import { BaseField } from '../../shared';

@Component({
  selector: 'text-area-field',
  templateUrl: '../../shared/htmls/base-field.component.html',
  standalone: false,
})
export class TextAreaFieldComponent extends BaseField {
  override fieldType = 'textarea';
}
