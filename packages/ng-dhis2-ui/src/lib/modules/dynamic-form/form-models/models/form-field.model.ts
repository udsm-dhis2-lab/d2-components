import { camelCase } from 'lodash';
import { FieldControlType, FormFieldMetaType } from '../interfaces';
import { IFormField } from '../interfaces';
import { FieldDropdown } from './field-dropdown.model';
import { FieldType } from '../interfaces/field-type.interface';

export class FormField implements IFormField {
  id!: string;
  label!: string;
  key!: string;
  required!: boolean;
  type!: string;
  controlType!: FieldControlType;
  valueType?: string;
  options?: any[];
  disabled?: boolean;
  dependentField?: any;
  hasOptions?: boolean;
  min?: number;
  max?: number;
  fieldOptionsDependsOn?: string;
  order?: number;
  hidden?: boolean;
  metaType?: FormFieldMetaType;
  stepId?: string;

  constructor(params: {
    field: Record<string, unknown>;
    dependentField?: IFormField;
  }) {
    this.id = params.field['id'] as string;
    this.label = (params.field['formName'] ?? params.field['label']) as string;
    this.key = this.getKey(params.field);
    this.required = (params.field['mandatory'] ??
      params.field['required']) as boolean;
    this.type = this.getFieldType(params.field['valueType'] as string);
    this.dependentField = params.dependentField;
    this.options = FieldDropdown.getDropdownOptions(params.field);
    this.disabled = params.field['disabled'] as boolean;
    this.min = params.field['min'] as number;
    this.max = params.field['max'] as number;
    this.order = (params.field['order'] ?? params.field['sortOrder']) as number;
    this.hidden = params.field['hidden'] as boolean;
    this.fieldOptionsDependsOn = params.field[
      'fieldOptionsDependsOn'
    ] as string;

    this.hasOptions = (this.options?.length > 0 ||
      this.dependentField !== undefined ||
      params.field?.['hasOptions']) as boolean;

    this.controlType = FormField.getFieldControlType(
      params.field['valueType'] as string,
      this.hasOptions
    );
    this.metaType = params.field['metaType'] as FormFieldMetaType;
    this.stepId = params.field['stepId'] as string;
  }

  getKey(field: Record<string, unknown>): string {
    const code = field['code'] as string;
    if (code) {
      return camelCase(code);
    }

    return (field['key'] as string) ?? this.id;
  }

  toJson(): IFormField {
    return {
      id: this.id,
      label: this.label,
      key: this.key,
      required: this.required,
      type: this.type,
      controlType: this.controlType,
      options: this.options,
      disabled: this.disabled,
      dependentField: this.dependentField,
      hasOptions: this.hasOptions,
      order: this.order,
      hidden: this.hidden,
      min: this.min,
      max: this.max,
      metaType: this.metaType,
      stepId: this.stepId,
    };
  }

  getFieldType(valueType: string) {
    switch (valueType) {
      case FieldType.NUMBER:
        return 'number';
      case FieldType.EMAIL:
        return 'email';
      case FieldType.PHONE_NUMBER:
        return 'tel';
      case FieldType.DATE:
        return 'date';

      default:
        return 'text';
    }
  }

  static getFieldControlType(
    valueType: string,
    hasOptions: boolean
  ): FieldControlType {
    if (hasOptions) {
      return 'dropdown';
    }

    switch (valueType) {
      case FieldType.TEXT:
        return 'textbox';
      case FieldType.LONG_TEXT:
        return 'textbox';
      case FieldType.TRUE_ONLY:
        return 'checkbox';
      case FieldType.NUMBER:
        return 'textbox';
      case FieldType.DATE:
        return 'date';
      case FieldType.DATE_TIME:
        return 'date-time';
      default:
        return 'textbox';
    }
  }
}
