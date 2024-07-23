import { createSelector } from '@ngrx/store';
import { d2DashboardSelectionFeature } from '../reducers';

export const {
  selectDashboardSelections: getDashboardSelections,
  selectStartUpDataSelections: getStartUpSelections,
} = d2DashboardSelectionFeature;

export const getDashboardSelectionById = (id: string) =>
  createSelector(getDashboardSelections, (dashboardSelections) =>
    dashboardSelections ? dashboardSelections[id] : undefined
  );
