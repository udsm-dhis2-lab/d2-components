import { Component } from '@angular/core';
import { BaseField } from '../../shared';

@Component({
  selector: 'file-field',
  templateUrl: '../../shared/htmls/base-field.component.html',
  standalone: false,
})
export class FilefieldComponent extends BaseField {
  override fieldType = 'file';
}
