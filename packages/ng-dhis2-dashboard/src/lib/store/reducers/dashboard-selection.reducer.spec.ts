import { orgUnitSelection, periodSelection } from '../../../testing/dashboard.fixtures';
import { DashboardSelectionActions } from '../actions/dashboard-selection.actions';
import { d2DashboardSelectionFeature } from './dashboard-selection.reducer';

describe('dashboard selection reducer', () => {
  const reducer = d2DashboardSelectionFeature.reducer;

  it('stores startup selections for a dashboard', () => {
    const periods = [periodSelection()];
    const state = reducer(undefined, DashboardSelectionActions.setStartupSelections({
      dashboardId: 'dashboard-a', startUpDataSelections: periods,
    }));

    expect(state.startUpDataSelections).toEqual(periods);
    expect(state.dashboardSelections['dashboard-a']).toMatchObject({
      default: true, dataSelections: periods,
    });
  });

  it('keeps independent selections per dashboard', () => {
    let state = reducer(undefined, DashboardSelectionActions.setDashboardSelection({
      dashboardId: 'dashboard-a', dataSelections: [periodSelection()],
    }));
    state = reducer(state, DashboardSelectionActions.setDashboardSelection({
      dashboardId: 'dashboard-b', dataSelections: [orgUnitSelection()],
    }));

    expect(Object.keys(state.dashboardSelections)).toEqual(['dashboard-a', 'dashboard-b']);
    expect(state.dashboardSelections['dashboard-a'].dataSelections[0].dimension).toBe('pe');
    expect(state.dashboardSelections['dashboard-b'].dataSelections[0].dimension).toBe('ou');
  });

  it('restores startup selections when a selection is cleared', () => {
    let state = reducer(undefined, DashboardSelectionActions.setStartupSelections({
      dashboardId: 'dashboard-a', startUpDataSelections: [periodSelection()],
    }));
    state = reducer(state, DashboardSelectionActions.setDashboardSelection({
      dashboardId: 'dashboard-a', dataSelections: [],
    }));

    expect(state.dashboardSelections['dashboard-a'].default).toBe(true);
    expect(state.dashboardSelections['dashboard-a'].dataSelections[0].dimension).toBe('pe');
  });
});
