import { IField } from './field.interface';
import { IFormMetadataSection } from './form-metadata-section.interface';

export interface IFormMetadata {
  id: string;
  name: string;
  description?: string;
  fields: IField<string>[];
  sections: IFormMetadataSection[];
  rules: any[];
  downloadSqlView?: string;
}
