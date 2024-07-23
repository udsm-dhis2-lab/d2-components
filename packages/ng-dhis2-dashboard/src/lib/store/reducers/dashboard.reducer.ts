import { createFeature, createReducer } from '@ngrx/store';
import { DashboardObject } from '../../models';

interface D2DashboardState {
  dashboards: DashboardObject[];
  loading: boolean;
}

const initialState: D2DashboardState = {
  dashboards: [],
  loading: false,
};

export const d2DashboardFeature = createFeature({
  name: 'dashboards',
  reducer: createReducer(initialState),
});

export const {
  selectDashboardsState,
  selectDashboards,
  selectLoading: selectDashboardLoading,
} = d2DashboardFeature;
