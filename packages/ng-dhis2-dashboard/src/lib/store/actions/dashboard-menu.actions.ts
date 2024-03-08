import { ErrorMessage } from '@iapps/ngx-dhis2-http-client';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DashboardMenuObject } from '../../models';

export const DashboardMenuActions = createActionGroup({
  source: 'Dashboard Menu',
  events: {
    'Load dashboard menus': emptyProps(),
    'Load dashboard menus failed': props<{ loadingError: ErrorMessage }>(),
    'Save dashboard menus': props<{ dashboardMenus: DashboardMenuObject[] }>(),
    'Set current dashboard menu': props<{
      selectedDashboardMenu: DashboardMenuObject;
      selectedDashboardSubMenu?: DashboardMenuObject;
    }>(),
    'Set current dashboard sub menu': props<{
      selectedDashboardSubMenu: DashboardMenuObject;
    }>(),
  },
});
