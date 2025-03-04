import { Component } from '@angular/core';
import { BaseFormField } from '../../directives';

@Component({
  selector: 'ng-dhis2-ui-transfer-field',
  templateUrl: '../base-field.component.html',
  standalone: false,
})
export class TransferFieldComponent extends BaseFormField {
  override fieldType = 'transfer';
}
