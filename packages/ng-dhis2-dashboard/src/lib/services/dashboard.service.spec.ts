import { Overlay } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { installD2Web } from '../../testing/dashboard.fixtures';
import { DASHBOARD_CONFIG, DashboardConfigService } from './dashboard-config.service';
import { DashboardService } from './dashboard.service';
import { DashboardStateFacade } from '../state';

describe('DashboardService', () => {
  const router = { navigate: jest.fn().mockResolvedValue(true) };
  const snackBarRef = { dismiss: jest.fn() };
  const snackBar = { open: jest.fn(() => snackBarRef) };
  const overlayRef = { attach: jest.fn(), detach: jest.fn() };
  const overlay = {
    create: jest.fn(() => overlayRef),
    position: jest.fn(() => ({ global: () => ({
      centerHorizontally: () => ({ centerVertically: () => ({}) }),
    }) })),
  };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      DashboardService,
      DashboardStateFacade,
      DashboardConfigService,
      { provide: DASHBOARD_CONFIG, useValue: {
        rootUrl: 'dashboard', useDataStore: false,
        selectionConfig: { allowSelectionOnStartUp: false, startUpPeriodType: 'Yearly' },
      } },
      { provide: Router, useValue: router },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: MatSnackBarRef, useValue: snackBarRef },
      { provide: Overlay, useValue: overlay },
    ] });
  });

  it('loads and maps a dashboard while balancing its loading overlay', async () => {
    installD2Web({ 'dashboards/dashboard-a': {
      id: 'dashboard-a', name: 'A', dashboardItems: [
        { id: 'item-a', type: 'CHART', visualization: { id: 'visualization-a' } },
      ],
    } });

    const result = await firstValueFrom(
      TestBed.inject(DashboardService).getCurrentDashboard('dashboard-a')
    );

    expect(result).toMatchObject({ id: 'dashboard-a', name: 'A' });
    expect(result?.dashboardItems).toHaveLength(1);
    expect(overlayRef.attach).toHaveBeenCalledTimes(1);
    expect(overlayRef.detach).toHaveBeenCalled();
  });

  it('returns undefined and exposes a snackbar when loading fails', async () => {
    installD2Web({});

    await expect(firstValueFrom(
      TestBed.inject(DashboardService).getCurrentDashboard('missing')
    )).resolves.toBeUndefined();
    expect(snackBar.open).toHaveBeenCalledWith(
      'There was a problem loading dashboard of ID: missing', 'OK'
    );
  });

  it('stores and navigates to a selected dashboard', async () => {
    const service = TestBed.inject(DashboardService);
    await service.setCurrentDashboard({ id: 'dashboard-a', name: 'A' });

    await expect(firstValueFrom(service.getCurrentDashboardId())).resolves.toBe('dashboard-a');
    expect(router.navigate).toHaveBeenCalledWith([
      'dashboard', 'ng-dashboard-view', 'dashboard-a',
    ]);
  });

  it('derives the current ID from submenu before parent menu state', () => {
    TestBed.inject(DashboardStateFacade).activateDashboard('child');
    expect(TestBed.inject(DashboardService).currentDashboardId()).toBe('child');
  });
});
