import { Field } from './field.model';
import { FieldControlType } from '../interfaces';

export class Dropdown extends Field<string> {
  override controlType: FieldControlType = 'dropdown';
}
