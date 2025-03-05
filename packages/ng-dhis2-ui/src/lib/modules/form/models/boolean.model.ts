import { FieldControlType } from '../interfaces';
import { FormField } from './form-field.model';

export class Boolean extends FormField<string> {
  override controlType: FieldControlType = 'boolean';
}
