import { orgUnitSelection, periodSelection } from '../../testing/dashboard.fixtures';
import { DashboardItem } from './dashboard-item.model';
import { DashboardMenu } from './dashboard-menu.model';
import { Dashboard } from './dashboard.model';
import { GlobalSelection } from './global-selection.model';

describe('dashboard domain models', () => {
  it('maps dashboard items and their grid layout', () => {
    const result = new Dashboard({
      id: 'dashboard-a', name: 'Coverage',
      dashboardItems: [{
        id: 'item-a', type: 'CHART', x: 2, y: 3, width: 10, height: 8,
        visualization: { id: 'visualization-a' },
      }],
    }).toObject();

    expect(result.dashboardItems?.[0]).toMatchObject({
      id: 'item-a', type: 'CHART', x: 2, y: 3, w: 10, h: 8,
      visualization: { id: 'visualization-a' },
    });
    expect(result.dashboardItemsLayout).toEqual([
      { id: 'item-a', x: 2, y: 3, w: 10, h: 8 },
    ]);
  });

  it('uses fallback grid positions and the legacy chart alias', () => {
    const first = new DashboardItem(
      { id: 'one', type: 'CHART', chart: { id: 'chart-a' } }, 0
    ).toObject();
    const second = new DashboardItem(
      { id: 'two', type: 'CHART', chart: { id: 'chart-b' } }, 1
    ).toObject();

    expect(first).toMatchObject({ x: 0, y: 0, w: 29, h: 20 });
    expect(second).toMatchObject({ x: 29, y: 0 });
    expect(first.visualization).toEqual({ id: 'chart-a' });
  });

  it('resolves direct, nested, and default dashboard menus', () => {
    const menus = [
      { id: 'parent', name: 'Parent', subMenus: [{ id: 'child', name: 'Child' }] },
      { id: 'other', name: 'Other' },
    ];

    expect(DashboardMenu.getCurrentDashboardMenu(menus, '')).toEqual({
      selectedDashboardMenu: menus[0], selectedDashboardSubMenu: menus[0].subMenus?.[0],
    });
    expect(DashboardMenu.getCurrentDashboardMenu(menus, 'other')).toEqual({
      selectedDashboardMenu: menus[1],
    });
    expect(DashboardMenu.getCurrentDashboardMenu(menus, 'child')).toEqual({
      selectedDashboardMenu: menus[0], selectedDashboardSubMenu: menus[0].subMenus?.[0],
    });
  });

  it('builds the user-visible global selection summary', () => {
    const selection = new GlobalSelection({
      default: false, dataSelections: [periodSelection(), orgUnitSelection()],
    });

    expect(selection.summary).toBe(
      'Showing data for Period: 2024 - Organisation unit: Facility A'
    );
    expect(new GlobalSelection({ dataSelections: [] }).summary).toBeUndefined();
  });
});
