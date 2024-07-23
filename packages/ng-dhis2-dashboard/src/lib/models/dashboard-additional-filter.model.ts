export interface DashboardAdditionalFilter {
  dimension: 'tea' | 'de';
  domain: 'TRACKER' | 'AGGREGATE';
  label: string;
  id: string;
  icon?: string;
  singleSelection?: boolean;
  optionSet?: {
    id: string;
    options?: any[];
  };
}
