import { FormField } from './form-field.model';
import { FieldControlType } from '../interfaces';

export class Dropdown extends FormField<string> {
  override controlType: FieldControlType = 'dropdown';
}
