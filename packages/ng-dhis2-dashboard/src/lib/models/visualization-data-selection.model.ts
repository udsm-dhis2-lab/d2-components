import { PeriodInterface } from '@iapps/period-utilities';

export interface VisualizationDataSelection {
  dimension: string;
  name?: string;
  layout?: string;
  filter?: string;
  optionSet?: any;
  legendSet?: string;
  changed?: boolean;
  lowestPeriodType?: string;
  items: VisualizationDataSelectionItem[] | PeriodInterface[];
  groups?: Array<{
    id: string;
    name: string;
    members: Array<string>;
  }>;
}

export interface VisualizationDataSelectionItem {
  id: string;
  dimensionItem: string;
  name: string;
  type?: string;
  functionObject?: any;
}
