import { FieldControlType } from '../interfaces';
import { Field } from './field.model';

export class TextArea extends Field<string> {
  override controlType: FieldControlType = 'textarea';
}
