import { FormField } from './form-field.model';
import { FieldControlType } from '../interfaces';

export class CheckBox extends FormField<string> {
  override controlType: FieldControlType = 'checkbox';
}
