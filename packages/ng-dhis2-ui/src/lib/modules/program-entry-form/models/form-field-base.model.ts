import { OptionSet } from '@iapps/d2-web-sdk';

export interface IEntityFormFieldBase {
  id: string;
  code?: string;
  formName?: string;
  name: string;
  description?: string;
  mandatory: boolean;
  valueType?: string;
  sortOrder?: number;
  optionSet?: OptionSet;
}
