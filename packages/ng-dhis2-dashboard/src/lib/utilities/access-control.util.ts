import { User } from '@iapps/ngx-dhis2-http-client';
import { DashboardMenuObject } from '../models';

export function translateAccess(access = '') {
  const translatedAccess = {
    read: false,
    write: false,
  };
  if (access.includes('r')) {
    translatedAccess.read = true;
  }
  if (access.includes('w')) {
    translatedAccess.write = true;
  }
  return translatedAccess;
}

export function authorizedToViewItem(
  dashboardItem: DashboardMenuObject,
  currentUser: User
) {
  if (dashboardItem?.sharing) {
    if (dashboardItem?.sharing?.owner === currentUser?.id) {
      return true;
    }

    if (translateAccess(dashboardItem?.sharing?.public).read) {
      return true;
    }

    if (dashboardItem?.sharing?.users[currentUser?.id]) {
      return true;
    }

    if (
      currentUser?.userGroups.some(
        (userGroup) => dashboardItem?.sharing?.userGroups[userGroup?.id]
      )
    ) {
      return true;
    }
  }

  return false;
}

export function userAuthorizedDashboards(
  customDashboards: DashboardMenuObject[],
  currentUser: User
) {
  const authorizedDashboards = customDashboards
    .map((dashboardObject) => {
      const subMenus = (dashboardObject?.subMenus || []).filter((subMenuItem) =>
        authorizedToViewItem(subMenuItem, currentUser)
      );
      if (authorizedToViewItem(dashboardObject, currentUser)) {
        return {
          ...dashboardObject,
          subMenus: subMenus,
        };
      } else {
        return null;
      }
      // return dashboardObject;
    })
    .filter((item) => item);

  return authorizedDashboards;
  //   customDashboards.forEach((dashboardObject) => {
  //     if (dashboardObject?.sharing) {
  //       if (dashboardObject?.sharing?.owner === currentUser?.id) {
  //         authorizedDashboards;
  //       }
  //     }

  //     // if () {}
  //   });
}
