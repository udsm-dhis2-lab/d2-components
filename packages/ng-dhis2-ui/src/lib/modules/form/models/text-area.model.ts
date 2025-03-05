import { FieldControlType } from '../../form-field/interfaces';
import { FormField } from './form-field.model';

export class TextArea extends FormField<string> {
  override controlType: FieldControlType = 'textarea';
}
