import { IFormField } from './form-field.interface';
import { IFormMetadataSection } from './form-metadata-section.interface';

export interface IFormMetadata {
  id: string;
  name: string;
  description?: string;
  fields: IFormField<string>[];
  sections: IFormMetadataSection[];
  rules: any[];
  downloadSqlView?: string;
}
