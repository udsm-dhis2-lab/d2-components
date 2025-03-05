import { FieldControlType } from '../../form-field/interfaces';
import { FormField } from './form-field.model';

export class Textbox extends FormField<string> {
  override controlType: FieldControlType = 'textbox';
}
