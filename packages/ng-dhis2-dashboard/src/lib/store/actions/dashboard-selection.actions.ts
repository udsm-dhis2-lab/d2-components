import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { VisualizationDataSelection } from '../../models';

export const DashboardSelectionActions = createActionGroup({
  source: 'Dashboard Selection',
  events: {
    'Get startup selections': emptyProps(),
    'Set startup selections': props<{
      startUpDataSelections: any;
      dashboardId?: string;
    }>(),
    'Set dashboard selection': props<{
      dataSelections: VisualizationDataSelection[];
      dashboardId: string;
    }>(),
  },
});
