import { DashboardObject } from './dashboard.model';

export interface DashboardResponse {
  loading: boolean;
  error?: object;
  dashboard?: DashboardObject;
}
