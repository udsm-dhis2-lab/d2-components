import {
  DestroyRef,
  EnvironmentInjector,
  createEnvironmentInjector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import {
  dashboard,
  orgUnitSelection,
} from '../../../testing/dashboard.fixtures';
import { DashboardConfigService } from '../../services/dashboard-config.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStateFacade } from '../../state';
import { CurrentDashboardComponent } from './current-dashboard.component';

describe('CurrentDashboardComponent signal state', () => {
  let component: CurrentDashboardComponent;
  let dashboardState: DashboardStateFacade;
  let environmentInjector: EnvironmentInjector;
  let unsubscribe: jest.Mock;
  let getCurrentDashboard: jest.Mock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    dashboardState = new DashboardStateFacade();
    unsubscribe = jest.fn();
    getCurrentDashboard = jest.fn(
      () =>
        new Observable(() => {
          return unsubscribe;
        })
    );
    environmentInjector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector)
    );

    component = runInInjectionContext(environmentInjector, () => {
      const instance = new CurrentDashboardComponent(
        { getCurrentDashboard } as unknown as DashboardService,
        {
          getConfig: () => ({
            rootUrl: 'dashboard',
            selectionConfig: { allowSelectionOnStartUp: false },
          }),
        } as DashboardConfigService,
        dashboardState,
        inject(DestroyRef)
      );
      instance.ngOnInit();
      return instance;
    });
  });

  afterEach(() => {
    if (!environmentInjector.destroyed) {
      environmentInjector.destroy();
    }
  });

  it('loads active dashboards, exposes signal state, and forwards filters', () => {
    const current = dashboard({ id: 'dashboard-a' });
    dashboardState.activateDashboard(current.id);
    TestBed.tick();

    expect(getCurrentDashboard).toHaveBeenCalledWith(current.id);

    dashboardState.setDashboard(current);
    component.onSetGlobalFilter([orgUnitSelection()], current.id);

    expect(component.currentDashboard()).toEqual(current);
    expect(component.globalSelection()?.dataSelections).toEqual([
      orgUnitSelection(),
    ]);
  });

  it('cancels its dashboard request when its injector is destroyed', () => {
    dashboardState.activateDashboard('dashboard-a');
    TestBed.tick();

    environmentInjector.destroy();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
