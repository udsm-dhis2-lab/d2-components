import { format } from 'date-fns';
import { FieldControlType } from '../interfaces';
import { FormField } from './form-field.model';

export class DateField extends FormField<string> {
  override controlType: FieldControlType = 'date';
  override type = 'date';
  constructor(field: Partial<DateField>) {
    super(field);
    this.max = field.max ?? format(new Date(), 'yyyy-MM-dd');
  }
}
