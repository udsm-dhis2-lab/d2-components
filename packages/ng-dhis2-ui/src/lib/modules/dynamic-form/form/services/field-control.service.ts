import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Field, FieldsData } from '../../form-models/models';


@Injectable({ providedIn: 'root' })
export class FieldControlService {
  constructor() {}

  toFormGroup(fields: Field<string>[], fieldsData?: FieldsData): FormGroup {
    const group: any = {};
    fields.forEach((field) => {
      const fieldData = fieldsData ? fieldsData[field.id]?.latest : null;
      group[field.key] = field.required
        ? new FormControl(
            fieldData?.value || field.value || '',
            Validators.required
          )
        : new FormControl(fieldData?.value || field.value || '');
    });

    return new FormGroup(group);
  }
}
