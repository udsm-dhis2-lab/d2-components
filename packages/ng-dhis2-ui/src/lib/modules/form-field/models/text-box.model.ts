import { FieldControlType } from '../interfaces';
import { FormField } from './form-field.model';

export class Textbox extends FormField<string> {
  override controlType: FieldControlType = 'textbox';
}
