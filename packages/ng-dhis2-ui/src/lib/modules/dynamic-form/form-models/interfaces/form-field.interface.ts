import { FieldControlType } from './field-control-type.interface';
import { FormFieldMetaType } from './form-field-meta-type.interface';

export interface IFormField {
  id: string;
  label: string;
  key: string;
  required: boolean;
  type: string;
  controlType: FieldControlType;
  valueType?: string;
  options?: any[];
  disabled?: boolean;
  dependentField?: any;
  hasOptions?: boolean;
  order?: number;
  hidden?: boolean;
  placeholder?: string;
  fieldOptionsDependsOn?: string;
  min?: number | Date | string;
  max?: number | Date | string;
  metaType?: FormFieldMetaType;
  stepId?: string;
}
