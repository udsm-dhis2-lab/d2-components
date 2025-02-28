import { Field } from './field.model';
import { FieldControlType } from '../interfaces';

export class CheckBox extends Field<string> {
  override controlType: FieldControlType = 'checkbox';
}
