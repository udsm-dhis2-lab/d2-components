import { FormGroup } from '@angular/forms';
import { find } from 'lodash';
import { IFormField } from '../interfaces';

export class FormValue {
  form: FormGroup;
  fields: IFormField<string>[];
  changedField?: IFormField<string>;
  constructor(
    form: FormGroup,
    fields: IFormField<string>[],
    changedField?: IFormField<string>
  ) {
    this.form = form;
    this.fields = fields;
    this.changedField = changedField;
  }

  get isValid(): boolean {
    return this.form.valid;
  }

  clear(): void {
    this.form.reset();
  }

  getValues(options?: { valueOnly?: boolean }): {
    [id: string]: { id: string; value: string; options: any[] };
  } {
    const newValues: { [key: string]: any } = {};
    const formValues = this.form?.getRawValue();

    if (options?.valueOnly) {
      return formValues;
    }

    Object.keys(formValues).forEach((key) => {
      const field = find(this.fields, ['key', key]);

      if (field) {
        newValues[key] = {
          ...field,
          value: formValues[key],
        };
      }
    });

    return newValues;
  }
}
