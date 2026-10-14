import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { installD2Web } from '../../testing/dashboard.fixtures';
import { DASHBOARD_CONFIG, DashboardConfigService } from './dashboard-config.service';
import { DashboardMenuService } from './dashboard-menu.service';

describe('DashboardMenuService', () => {
  const router = { navigate: jest.fn().mockResolvedValue(true) };

  const configure = (config: Record<string, unknown>) => {
    TestBed.configureTestingModule({ providers: [
      DashboardMenuService,
      DashboardConfigService,
      { provide: Router, useValue: router },
      { provide: DASHBOARD_CONFIG, useValue: config },
    ] });
    return TestBed.inject(DashboardMenuService);
  };

  it('loads API menus, derives direct-route state, and navigates to the selected dashboard', async () => {
    installD2Web({ 'dashboards.json': { dashboards: [
      { id: 'dashboard-a', name: 'A' }, { id: 'dashboard-b', name: 'B' },
    ] } });
    window.history.replaceState({}, '', '/dashboard/ng-dashboard-view/dashboard-b');
    const service = configure({ rootUrl: 'dashboard', useDataStore: false });

    service.load();
    await Promise.resolve();
    await Promise.resolve();

    expect(service.loading()).toBe(false);
    expect(service.currentDashboardMenu()?.id).toBe('dashboard-b');
    expect(router.navigate).toHaveBeenCalledWith([
      'dashboard', 'ng-dashboard-view', 'dashboard-b',
    ]);
  });

  it('filters data-store menus using current-user sharing', async () => {
    installD2Web({ 'dataStore/custom/summary': [
      { id: 'visible', name: 'Visible', sharing: {
        owner: 'user-a', public: '--------', external: false, users: {}, userGroups: {},
      } },
      { id: 'hidden', name: 'Hidden', sharing: {
        owner: 'other', public: '--------', external: false, users: {}, userGroups: {},
      } },
    ] });
    const service = configure({ rootUrl: 'dashboard', useDataStore: true,
      dataStoreNamespace: 'custom' });

    await expect(firstValueFrom(service.getMenus())).resolves.toEqual([
      { id: 'visible', name: 'Visible', subMenus: [] },
    ]);
  });

  it('uses the established parent and submenu navigation shapes', () => {
    const service = configure({ rootUrl: 'dashboard', useDataStore: false });
    const child = { id: 'child-a', name: 'Child' };

    service.setCurrentDashboardMenu({ id: 'parent-a', name: 'Parent', subMenus: [child] });
    expect(router.navigate).toHaveBeenLastCalledWith([
      'dashboard', 'ng-dashboard-view', 'child-a',
    ]);

    service.setCurrentSubDashboard(child);
    expect(router.navigate).toHaveBeenLastCalledWith(['dashboard', 'child-a']);
  });
});
