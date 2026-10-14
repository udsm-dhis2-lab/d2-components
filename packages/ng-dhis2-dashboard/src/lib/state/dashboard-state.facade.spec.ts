import { TestBed } from '@angular/core/testing';
import {
  dashboard,
  dashboardMenu,
  orgUnitSelection,
  periodSelection,
} from '../../testing/dashboard.fixtures';
import { DashboardStateFacade } from './dashboard-state.facade';

describe('DashboardStateFacade', () => {
  let facade: DashboardStateFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardStateFacade] });
    facade = TestBed.inject(DashboardStateFacade);
  });

  it('loads menus and derives the selected menu and submenu', () => {
    const child = dashboardMenu({ id: 'child', name: 'Child' });
    const parent = dashboardMenu({
      id: 'parent',
      name: 'Parent',
      subMenus: [child],
    });

    facade.beginMenuLoad();
    expect(facade.loading().menus).toBe(true);

    facade.setMenus([parent], parent.id, child.id);

    expect(facade.menus()).toEqual([parent]);
    expect(facade.selectedMenu()).toEqual(parent);
    expect(facade.selectedSubMenu()).toEqual(child);
    expect(facade.activeDashboardId()).toBe(child.id);
    expect(facade.loading().menus).toBe(false);
  });

  it('selects only menu-owned submenus and derives the active dashboard ID', () => {
    const child = dashboardMenu({ id: 'child' });
    const parent = dashboardMenu({ id: 'parent', subMenus: [child] });
    facade.setMenus([parent]);

    facade.selectMenu(parent.id, child.id);
    expect(facade.activeDashboardId()).toBe(child.id);

    facade.selectMenu(parent.id, 'unknown');
    expect(facade.selectedSubMenu()).toBeUndefined();
    expect(facade.activeDashboardId()).toBe(parent.id);

    facade.selectMenu('unknown');
    expect(facade.activeDashboardId()).toBe(parent.id);
  });

  it('records menu failures and clears them when retrying', () => {
    const error = new Error('menu failed');
    facade.failMenuLoad(error);
    expect(facade.errors().menus).toBe(error);

    facade.beginMenuLoad();
    expect(facade.errors().menus).toBeNull();
    expect(facade.loading().menus).toBe(true);
  });

  it('stores dashboards immutably and derives the active dashboard', () => {
    const first = dashboard({ id: 'first' });
    const second = dashboard({ id: 'second' });

    facade.setDashboard(first);
    const originalDashboards = facade.dashboards();
    facade.setDashboard(second);

    expect(facade.activeDashboard()).toEqual(second);
    expect(facade.dashboards()).toEqual({ first, second });
    expect(facade.dashboards()).not.toBe(originalDashboards);
  });

  it('tracks dashboard loading and failure without affecting menu status', () => {
    facade.beginMenuLoad();
    facade.beginDashboardLoad('dashboard-a');
    const error = new Error('dashboard failed');
    facade.failDashboardLoad(error);

    expect(facade.loading()).toEqual({ menus: true, dashboard: false });
    expect(facade.errors()).toEqual({ menus: null, dashboard: error });
    expect(facade.activeDashboardId()).toBe('dashboard-a');
  });

  it('uses dashboard selections as filters and falls back to startup selections', () => {
    const startup = periodSelection();
    const override = orgUnitSelection();
    facade.setStartupSelections([startup]);
    facade.activateDashboard('dashboard-a');

    facade.setDashboardSelection('dashboard-a', []);
    expect(facade.activeSelection()).toMatchObject({
      default: true,
      dataSelections: [startup],
    });
    expect(facade.filters()).toEqual([startup]);

    facade.setDashboardSelection('dashboard-a', [override]);
    expect(facade.activeSelection()).toMatchObject({
      default: false,
      dataSelections: [override],
    });
    expect(facade.filters()).toEqual([override]);
  });

  it('can attach startup selections to a dashboard', () => {
    const startup = periodSelection();
    facade.setStartupSelections([startup], 'dashboard-a');
    facade.activateDashboard('dashboard-a');

    expect(facade.activeSelection()).toMatchObject({
      default: true,
      dataSelections: [startup],
    });
  });

  it('initializes a dashboard selection only once', () => {
    const explicit = orgUnitSelection();
    facade.setStartupSelections([periodSelection()]);
    facade.setDashboardSelection('dashboard-a', [explicit]);

    facade.ensureDashboardSelection('dashboard-a');
    expect(facade.activeSelection()).toBeUndefined();

    facade.activateDashboard('dashboard-a');
    expect(facade.activeSelection()?.dataSelections).toEqual([explicit]);

    facade.ensureDashboardSelection('dashboard-b');
    facade.activateDashboard('dashboard-b');
    expect(facade.activeSelection()).toMatchObject({
      default: true,
      dataSelections: [periodSelection()],
    });
  });

  it('resets one dashboard without disturbing other dashboard state', () => {
    const first = dashboard({ id: 'first' });
    const second = dashboard({ id: 'second' });
    facade.setDashboard(first);
    facade.setDashboardSelection(first.id, [periodSelection()]);
    facade.setDashboard(second);

    facade.resetDashboard(first.id);

    expect(facade.dashboards()).toEqual({ second });
    expect(facade.activeDashboardId()).toBe(second.id);
    facade.activateDashboard(first.id);
    expect(facade.activeSelection()).toBeUndefined();
  });

  it('resets every state slice to a fresh initial value', () => {
    facade.setMenus([dashboardMenu()]);
    facade.setDashboard(dashboard());
    facade.setStartupSelections([periodSelection()]);
    facade.failMenuLoad(new Error('failed'));

    facade.reset();

    expect(facade.menus()).toEqual([]);
    expect(facade.dashboards()).toEqual({});
    expect(facade.activeDashboardId()).toBeNull();
    expect(facade.startupSelections()).toEqual([]);
    expect(facade.filters()).toEqual([]);
    expect(facade.loading()).toEqual({ menus: false, dashboard: false });
    expect(facade.errors()).toEqual({ menus: null, dashboard: null });
  });
});
