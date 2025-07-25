// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { camelCase, find } from 'lodash';
import { FormFieldMetaType, IFormField, IFormFieldGroup } from '../interfaces';
import { FieldUtil, TranslationUtil } from '../utils';
import { FieldDropdown } from './field-dropdown.model';
import { FormField } from './form-field.model';
import { FormFieldExtension } from '../interfaces/form-field-extension.interface';

export class FormFieldGroup implements IFormFieldGroup {
  id!: string;
  name!: string;
  translations?: any;
  isFormHorizontal?: boolean | undefined;
  attributes?: string[] | object[] | undefined;
  dataElements?: string[] | object[] | undefined;
  booleanGroupedDataElements?: string[] | object[] | undefined;
  repeatableStage?: string | undefined;
  repeatDependentField?: string | undefined;
  dataKey?: string | undefined;

  constructor(
    private params: {
      formFieldGroup: Partial<FormFieldGroup>;
      fieldMetaData: Record<string, unknown>[];
      locale?: string;
      formFieldExtensions?: FormFieldExtension[];
    }
  ) {}

  get fields(): IFormField<string>[] {
    const fields = this.params.formFieldGroup?.fields || [];
    return fields
      .map((field) => {
        if (field instanceof FormField) {
          return field;
        }

        const fieldMetaData = this.params.fieldMetaData.find(
          (attribute) => attribute['id'] === field.id
        );

        if (!fieldMetaData) {
          return null;
        }

        const dependentField = find(fields, [
          'id',
          field?.fieldOptionsDependsOn,
        ]);

        const options = FieldDropdown.getDropdownOptions(
          fieldMetaData as any,
          this.params.locale
        );

        const hasOptions = (options?.length > 0 ||
          dependentField !== undefined ||
          fieldMetaData['hasOptions']) as boolean;

        const extension = this.params.formFieldExtensions?.find(
          (fieldExtension) => fieldExtension?.id === field.id
        );

        return new FormField({
          ...(fieldMetaData || {}),
          ...field,
          id: field.id,
          code: fieldMetaData['code'] as string,
          label: (fieldMetaData['formName'] ??
            fieldMetaData['name'] ??
            field['label']) as string,
          key: camelCase(fieldMetaData['code'] as string) || field.id,
          required: (fieldMetaData['mandatory'] ??
            fieldMetaData['required']) as boolean,
          type: FieldUtil.getFieldType(fieldMetaData['valueType'] as string),
          dependentField,
          options,
          disabled:
            field.disabled ??
            (fieldMetaData['disabled'] as boolean) ??
            (fieldMetaData['generated'] as boolean),
          min: field.min ?? (fieldMetaData['min'] as number),
          max: field.max ?? (fieldMetaData['max'] as number),
          order:
            field.order ??
            ((fieldMetaData['order'] ?? fieldMetaData['sortOrder']) as number),
          hidden: field.hidden ?? (fieldMetaData['hidden'] as boolean),
          fieldOptionsDependsOn: field.fieldOptionsDependsOn,
          hasOptions,
          controlType: FieldUtil.getFieldControlType(
            fieldMetaData['valueType'] as string,
            hasOptions
          ),
          metaType: fieldMetaData['metaType'] as FormFieldMetaType,
          stepId: fieldMetaData['stepId'] as string,
          extension,
        });
      })
      .filter((field) => field) as IFormField<string>[];
  }

  toJson(): IFormFieldGroup {
    return {
      id: this.params.formFieldGroup?.id as string,
      name: TranslationUtil.getTranslatedFormName(
        this.params.formFieldGroup,
        this.params.locale
      ) as string,
      isFormHorizontal: this.params.formFieldGroup?.isFormHorizontal,
      repeatDependentField: this.params.formFieldGroup?.repeatDependentField,
      dataKey: this.params.formFieldGroup?.dataKey,
      repeatableStage: this.params.formFieldGroup?.repeatableStage,
      fields: this.fields,
    };
  }
}
