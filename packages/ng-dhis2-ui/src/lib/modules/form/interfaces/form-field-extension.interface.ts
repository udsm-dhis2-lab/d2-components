export interface FormFieldExtension {
  id: string;
  accept?: string[];
  sizeLimit?: number;
  isDataElementUnique?: boolean;
  optionSetGroup?: string;
  organisationUnits?: any[]
}
