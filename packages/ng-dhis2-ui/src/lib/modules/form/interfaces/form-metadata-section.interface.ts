import { IFormFieldGroup } from './form-field-group.interface';

export interface IFormMetadataSection {
  id: string;
  name: string;
  program?: string;
  sectionStateComplete?: boolean;
  description?: string;
  translations?: any;
  fieldGroups: IFormFieldGroup[];
}
