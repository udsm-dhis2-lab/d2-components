import { Component } from '@angular/core';
import { BaseField } from '../../shared';

@Component({
  selector: 'transfer-field',
  templateUrl: '../../shared/htmls/base-field.component.html',
})
export class TransferFieldComponent extends BaseField {
  override fieldType = 'transfer';
}
