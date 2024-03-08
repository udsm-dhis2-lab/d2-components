import { createFeature, createReducer, on } from '@ngrx/store';
import { VisualizationDataSelection } from '../../models';
import {
  GlobalSelection,
  IGlobalSelection,
} from '../../models/global-selection.model';
import { DashboardSelectionActions } from '../actions/dashboard-selection.actions';

export interface D2DashboardSelectionState {
  loading: boolean;
  dashboardSelections: {
    [id: string]: IGlobalSelection;
  };
  startUpDataSelections: VisualizationDataSelection[];
}

const initialState: D2DashboardSelectionState = {
  dashboardSelections: {},
  loading: false,
  startUpDataSelections: [],
};

export const d2DashboardSelectionFeature = createFeature({
  name: 'dashboardSelections',
  reducer: createReducer(
    initialState,
    on(
      DashboardSelectionActions.setStartupSelections,
      (state, { startUpDataSelections, dashboardId }) => {
        if (dashboardId) {
          return {
            ...state,
            startUpDataSelections,
            dashboardSelections: {
              ...state.dashboardSelections,
              [dashboardId]: new GlobalSelection({
                default: true,
                dataSelections: startUpDataSelections,
              }),
            },
          };
        }

        return {
          ...state,
          startUpDataSelections,
        };
      }
    ),
    on(
      DashboardSelectionActions.setDashboardSelection,
      (state, { dashboardId, dataSelections }) => {
        const selections =
          dataSelections.length > 0
            ? {
                default: false,
                dataSelections,
              }
            : state.startUpDataSelections.length > 0
            ? {
                default: true,
                dataSelections: state.startUpDataSelections,
              }
            : { default: false, dataSelections: [] };

        return {
          ...state,
          dashboardSelections: {
            ...state.dashboardSelections,
            [dashboardId]: new GlobalSelection(selections),
          },
        };
      }
    )
  ),
});
