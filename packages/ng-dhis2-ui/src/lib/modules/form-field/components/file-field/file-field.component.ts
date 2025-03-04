import { Component } from '@angular/core';
import { BaseFormField } from '../../directives';

@Component({
  selector: 'ng-dhis2-ui-file-field',
  templateUrl: '../base-field.component.html',
  standalone: false,
})
export class FilefieldComponent extends BaseFormField {
  override fieldType = 'file';
}
