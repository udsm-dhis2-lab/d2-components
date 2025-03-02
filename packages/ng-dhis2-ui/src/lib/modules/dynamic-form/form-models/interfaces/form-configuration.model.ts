export interface FormGroupField {
  id: string;
  label?: string;
  formName?: string;
  fieldType:
    | 'ATTRIBUTE'
    | 'DATA_ELEMENT'
    | 'ORG_UNIT'
    | 'ENROLLMENT_DATE'
    | 'CUSTOM';
  disabled?: boolean;
  mandatory?: boolean;
  fieldOptionsDependsOn?: string;
  optionType?: 'ORG_UNIT' | 'PORT_OF_ENTRY' | 'CUSTOM';
  hasOptions?: boolean;
  valueType?: string;
  openFutureDays?: number;
  openPreviousDays?: number;
  skipSaving?: boolean;
  stageId?: string;
  trackedEntityInstance?: string;
  event?: string;
  min?: number | Date | string;
  max?: number | Date | string;
  optionSet?: any;
  translations?: any;
}

// TODO: This model is already somewhere, find ways to merge
interface FormFieldGroup {
  id: string;
  name: string;
  translations?: any;
  isFormHorizontal?: boolean;
  attributes?: string[] | object[];
  dataElements?: string[] | object[];
  booleanGroupedDataElements?: string[] | object[];
  fields: any[];
  repeatableStage?: string;
  repeatDependentField?: string;
}

export interface FormSection {
  id: string;
  name: string;
  sectionStateComplete?: boolean;
  description?: string;
  translations?: any;
  fieldGroups: FormFieldGroup[];
}

export interface AddtionalAttributeFilter {
  attribute: string;
  value: any;
}

export interface FormConfiguration {
  id: string;
  name: string;
  description?: string;
  program: string;
  topOrgUnit?: string;
  trackedEntityType?: string;
  autoFilledAttributes?: string[];
  reservedAttribute?: string;
  sections: FormSection[];
  additionalAttributeFilters?: AddtionalAttributeFilter[];
  downloadSqlView?: string;
  sectionCategories?: Record<string, string[]>;
  optionGroups?: string[];
  dataElementGroup?: string[];
}
