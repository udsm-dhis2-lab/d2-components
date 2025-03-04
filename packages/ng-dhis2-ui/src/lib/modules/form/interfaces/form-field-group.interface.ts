import { IFormField } from '../../form-field';

export interface IFormFieldGroup {
  dataKey?: string;
  id: string;
  name: string;
  translations?: any;
  isFormHorizontal?: boolean;
  attributes?: string[] | object[];
  dataElements?: string[] | object[];
  booleanGroupedDataElements?: string[] | object[];
  fields: IFormField<string>[];
  repeatableStage?: string;
  repeatDependentField?: string;
}
