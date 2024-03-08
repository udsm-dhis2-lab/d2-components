import { flatten } from 'lodash';
import { SharingAccess } from './dashboard-access.model';
export interface DashboardMenuObject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subMenus?: DashboardMenuObject[];
  sharing?: SharingAccess;
}

export class DashboardMenu {
  constructor(public dashboard: { [key: string]: string | number | object }) {}

  static getCurrentDashboardMenu(
    dashboardMenus: DashboardMenuObject[],
    dashboardMenuIdFromUrl: string
  ): {
    selectedDashboardMenu: DashboardMenuObject;
    selectedDashboardSubMenu?: DashboardMenuObject;
  } {
    const selectedDashboardMenu = dashboardMenus.find(
      (dashboardMenuItem) => dashboardMenuItem.id === dashboardMenuIdFromUrl
    );

    if (selectedDashboardMenu) {
      return { selectedDashboardMenu };
    }

    const dashboardSubMenus = flatten(
      dashboardMenus.map((menu) => menu.subMenus || [])
    );

    const selectedDashboardSubMenu = dashboardSubMenus.find(
      (dashboardMenuItem) => dashboardMenuItem.id === dashboardMenuIdFromUrl
    );

    return {
      selectedDashboardMenu: selectedDashboardMenu || dashboardMenus[0],
      selectedDashboardSubMenu,
    };
  }

  toObject(): DashboardMenuObject {
    return {
      id: this.dashboard['id'] as string,
      name: this.dashboard['name'] as string,
      subMenus: this.dashboard['subMenus']
        ? (
            this.dashboard['subMenus'] as Array<{
              [key: string]: string | number | object;
            }>
          ).map((subMenu: { [key: string]: string | number | object }) =>
            new DashboardMenu(subMenu).toObject()
          )
        : undefined,
    };
  }
}
