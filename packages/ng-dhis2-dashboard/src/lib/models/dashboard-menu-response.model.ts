import { DashboardMenuObject } from './dashboard-menu.model';

export interface DashboardMenuResponse {
  loading: boolean;
  error?: object;
  dashboardMenuItems: DashboardMenuObject[];
}
