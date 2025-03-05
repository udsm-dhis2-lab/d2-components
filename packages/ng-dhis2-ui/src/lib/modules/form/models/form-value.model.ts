import { FormGroup } from '@angular/forms';
import { find } from 'lodash';
import { FormField } from './form-field.model';
export class FormValue {
  form: FormGroup;
  fields: FormField<string>[];
  changedField?: FormField<string>;
  constructor(
    form: FormGroup,
    fields: FormField<string>[],
    changedField?: FormField<string>
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

  getValues(): { [id: string]: { id: string; value: string; options: any[] } } {
    const newValues: { [key: string]: any } = {};
    const formValues = this.form?.getRawValue();

    Object.keys(formValues).forEach((key) => {
      const field = find(this.fields, ['key', key]);

      if (field) {
        newValues[key] = {
          id: field.id,
          value: formValues[key],
          options: field.options,
        };
      }
    });

    return newValues;
  }
}
