import { CurrentDashboardHeaderComponent } from './current-dashboard-header/current-dashboard-header.component';
import { DashboardItemHeaderComponent } from './dashboard-item-header/dashboard-item-header.component';
import { DashboardItemComponent } from './dashboard-item/dashboard-item.component';
import { DashboardItemsComponent } from './dashboard-items/dashboard-items.component';
import { DashboardLoaderComponent } from './dashboard-loader/dashboard-loader.component';
import { DashboardMenuItemComponent } from './dashboard-menu-item/dashboard-menu-item.component';
import { DashboardMenuComponent } from './dashboard-menu/dashboard-menu.component';
import { DashboardSelectionSummaryComponent } from './dashboard-selection-summary/dashboard-selection-summary.component';
import { DashboardSubMenuComponent } from './dashboard-sub-menu/dashboard-sub-menu.component';

export const d2DashboardComponents: any[] = [
  DashboardMenuComponent,
  DashboardSubMenuComponent,
  CurrentDashboardHeaderComponent,
  DashboardItemsComponent,
  DashboardMenuItemComponent,
  DashboardSelectionSummaryComponent,
  DashboardItemComponent,
  DashboardItemHeaderComponent,
];

export const d2DashboardEntryComponents: any[] = [DashboardLoaderComponent];
