import { Overlay } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { installD2Web } from '../../testing/dashboard.fixtures';
import { DASHBOARD_CONFIG, DashboardConfigService } from './dashboard-config.service';
import { DashboardMenuService } from './dashboard-menu.service';
import { DashboardService } from './dashboard.service';

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
  const store = { dispatch: jest.fn() };
  const menuService = {
    currentDashboardMenu: signal<{ id: string } | undefined>(undefined),
    currentDashboardSubMenu: signal<{ id: string } | undefined>(undefined),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      DashboardService,
      DashboardConfigService,
      { provide: DASHBOARD_CONFIG, useValue: {
        rootUrl: 'dashboard', useDataStore: false,
        selectionConfig: { allowSelectionOnStartUp: false, startUpPeriodType: 'Yearly' },
      } },
      { provide: Router, useValue: router },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: MatSnackBarRef, useValue: snackBarRef },
      { provide: Overlay, useValue: overlay },
      { provide: Store, useValue: store },
      { provide: DashboardMenuService, useValue: menuService },
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
    menuService.currentDashboardMenu.set({ id: 'parent' });
    menuService.currentDashboardSubMenu.set({ id: 'child' });
    expect(TestBed.inject(DashboardService).currentDashboardId()).toBe('child');
  });
});
