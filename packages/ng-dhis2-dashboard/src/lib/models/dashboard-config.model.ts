import { OrgUnitFilterConfig } from '@iapps/ngx-dhis2-org-unit-filter';
import { PeriodFilterConfig } from '@iapps/ngx-dhis2-period-filter';

export interface DashboardConfig {
  useDataStore?: boolean;
  dataStoreNamespace?: string;
  rootUrl: string;
  selectionConfig?: DashboardSelectionConfig;
}

export interface DashboardSelectionConfig {
  allowSelectionOnStartUp: boolean;
  startUpPeriodType: string;
  startUpPeriod?: string;
  periodConfig?: PeriodFilterConfig;
  orgUnitConfig?: OrgUnitFilterConfig;
}
