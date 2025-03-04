import { FieldControlType } from '../interfaces';
import { FormField } from './form-field.model';

export class TextArea extends FormField<string> {
  override controlType: FieldControlType = 'textarea';
}
