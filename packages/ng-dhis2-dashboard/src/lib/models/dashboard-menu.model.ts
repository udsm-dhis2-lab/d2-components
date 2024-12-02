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
    if (!dashboardMenuIdFromUrl) {
      const selectedDashboardMenu = (dashboardMenus || [])[0];
      return {
        selectedDashboardMenu,
        selectedDashboardSubMenu: (selectedDashboardMenu?.subMenus || [])[0],
      };
    }

    const selectedDashboardMenu = dashboardMenus.find(
      (dashboardMenuItem) => dashboardMenuItem.id === dashboardMenuIdFromUrl
    );

    if (selectedDashboardMenu) {
      return {
        selectedDashboardMenu,
      };
    }

    const dashboardSubMenus = flatten(
      dashboardMenus.map((menu) => menu.subMenus || [])
    );

    const selectedDashboardSubMenu = dashboardSubMenus.find(
      (dashboardMenuItem) => dashboardMenuItem.id === dashboardMenuIdFromUrl
    );

    return {
      selectedDashboardMenu: (dashboardMenus || []).filter((dashboardMenu) =>
        dashboardMenu.subMenus?.find(
          (dashboardSubMenu) =>
            dashboardSubMenu?.id === selectedDashboardSubMenu?.id
        )
      )[0],
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
