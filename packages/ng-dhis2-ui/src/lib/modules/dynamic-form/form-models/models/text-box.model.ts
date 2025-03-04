import { FieldControlType } from '../interfaces';
import { Field } from './field.model';

export class Textbox extends Field<string> {
  override controlType: FieldControlType = 'textbox';
}
