import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { camelCase, find, isArray } from 'lodash';
import { FormField } from '../models';
import { FieldUtil } from '../utils';
import { IFormField } from '../interfaces';

export class FormUtil {
  static getFormGroup(
    fields: IFormField<string>[],
    dataEntities: any
  ): UntypedFormGroup {
    const group: any = {};
    (fields || []).forEach((field: IFormField<string>) => {
      if (field) {
        const value = FormUtil.getFieldValue(field, dataEntities);
        const minValidators = field.min
          ? [Validators.min(field.min as number)]
          : [];

        const maxValidators = field.max
          ? [Validators.max(field.max as number)]
          : [];

        const phoneNumberValidator = field.type === 'tel' ? [] : [];

        const emailValidator =
          field.type === 'email'
            ? [
                Validators.pattern(
                  '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
                ),
              ]
            : [];

        group[field.key] = field.required
          ? new UntypedFormControl(
              { value, disabled: field.disabled },
              {
                validators: [
                  Validators.required,
                  ...minValidators,
                  ...maxValidators,
                  ...phoneNumberValidator,
                  ...emailValidator,
                ],
                updateOn: 'change',
              }
            )
          : new UntypedFormControl(
              { value, disabled: field.disabled },
              {
                validators: [
                  ...minValidators,
                  ...maxValidators,
                  ...phoneNumberValidator,
                  ...emailValidator,
                ],
              }
            );

        if (field.referenceKey) {
          const value = dataEntities
            ? dataEntities[field.referenceKey] || ''
            : '';
          group[field.referenceKey] = field.required
            ? new UntypedFormControl(
                { value, disabled: field.disabled },
                {
                  validators: [
                    Validators.required,
                    ...minValidators,
                    ...maxValidators,
                    ...phoneNumberValidator,
                    ...emailValidator,
                  ],
                  updateOn: 'change',
                }
              )
            : new UntypedFormControl(
                { value, disabled: field.disabled },
                {
                  validators: [
                    ...minValidators,
                    ...maxValidators,
                    ...phoneNumberValidator,
                    ...emailValidator,
                  ],
                }
              );
        }
      }
    });

    return new UntypedFormGroup(group);
  }

  static getFieldValue(
    field: IFormField<string>,
    dataEntities: Record<string, any>
  ) {
    const fieldValue = dataEntities
      ? dataEntities[field.id] || dataEntities[field.key] || ''
      : '';

    return isArray(fieldValue) ? JSON.stringify(fieldValue) : fieldValue;
  }

  static getFormFields(fields: any[]): FormField<string>[] {
    return (fields || []).map((field: any) => {
      const options = FieldUtil.getFieldDropdownOptions(field);

      const dependentField = find(fields, ['id', field.fieldOptionsDependsOn]);

      const label = field.formName || field.name || field.displayName;

      return new FormField<string>({
        id: field.id,
        label,
        code: field.code,
        key: camelCase(field.code) || field.id,
        referenceKey: field.referenceKey,
        required: field.mandatory && !field.generated,
        displayInList: field.displayInList,
        type: FieldUtil.getFieldType(field.valueType),
        controlType: FieldUtil.getFieldControlType(
          field.valueType,
          options?.length > 0 || field.hasOptions
        ),
        options,
        isDataElement: field.isDataElement,
        isAttribute: field.isAttribute,
        isOrgUnit: field.isOrgUnit,
        isEnrollmentDate: field.isEnrollmentDate,
        programStage: field.stageId,
        event: field.event,
        trackedEntityInstance: field.trackedEntityInstance,
        disabled: field.disabled || field.generated,
        dependentField: dependentField,
        min: field.min,
        max: field.max,
        maxLength: field.maxLength,
      });
    });
  }

  static createField(
    id: string,
    label: string,
    required: boolean,
    controlType:
      | 'textbox'
      | 'dropdown'
      | 'textarea'
      | 'transfer'
      | 'search'
      | 'file',
    disabled?: boolean,
    placeholder?: string,
    options?: Array<any>
  ): FormField<string> {
    return new FormField<string>({
      id,
      code: id,
      key: id,
      label,
      required,
      controlType,
      type: 'text',
      options: options ?? [],
      disabled: disabled ?? false,
      placeholder: placeholder,
    });
  }
}
