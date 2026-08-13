export interface FormFieldExtension {
  id: string;
  accept?: string[];
  sizeLimit?: number;
  isDataElementUnique?: boolean;
  optionsSourceCode?: string;
  organisationUnits?: any[];
  orgUnitRoots?: string[];
}
