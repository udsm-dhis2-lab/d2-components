export interface CustomFieldConfiguration {
  id: string;
  fieldOptionsDependsOn?: string;
  optionSet?: {
    options: any[];
  };
}
