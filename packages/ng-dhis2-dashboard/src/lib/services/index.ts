import { DashboardConfigService } from './dashboard-config.service';
import { DashboardItemService } from './dashboard-item.service';
import { DashboardMenuService } from './dashboard-menu.service';
import { DashboardService } from './dashboard.service';
import { TrackerDashboardService } from './tracker-dashboard.service';
import { DashboardStateFacade } from '../state';

export const d2DashboardServices: any[] = [
  DashboardService,
  DashboardItemService,
  TrackerDashboardService,
  DashboardMenuService,
  DashboardStateFacade,
];

export {
  DashboardService,
  DashboardItemService,
  DashboardConfigService,
  TrackerDashboardService,
  DashboardMenuService,
  DashboardStateFacade,
};
