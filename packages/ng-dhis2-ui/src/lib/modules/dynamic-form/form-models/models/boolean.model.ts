import { FieldControlType } from '../interfaces';
import { Field } from './field.model';

export class Boolean extends Field<string> {
  override controlType: FieldControlType = 'boolean';
}
