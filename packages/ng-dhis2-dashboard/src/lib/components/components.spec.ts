import { dashboardMenu, orgUnitSelection, periodSelection } from '../../testing/dashboard.fixtures';
import { CurrentDashboardHeaderComponent } from './current-dashboard-header/current-dashboard-header.component';
import { DashboardMenuItemComponent } from './dashboard-menu-item/dashboard-menu-item.component';
import { DashboardSelectionSummaryComponent } from './dashboard-selection-summary/dashboard-selection-summary.component';
import { DashboardSubMenuComponent } from './dashboard-sub-menu/dashboard-sub-menu.component';

const mouseEvent = () => ({ stopPropagation: jest.fn() } as unknown as MouseEvent);

describe('dashboard component interactions', () => {
  it('forwards filter selections from the current dashboard header', () => {
    const component = new CurrentDashboardHeaderComponent();
    const emitted = jest.fn();
    component.setGlobalFilter.subscribe(emitted);
    const selections = [periodSelection()];

    component.onFilterSelection(selections);
    expect(emitted).toHaveBeenCalledWith(selections);
  });

  it('emits a non-current menu and suppresses the current menu', () => {
    const component = new DashboardMenuItemComponent();
    component.dashboardMenuItem = dashboardMenu();
    const emitted = jest.fn();
    component.setDashboard.subscribe(emitted);

    component.isCurrentDashboard = false;
    component.onSetDashboard(mouseEvent());
    component.isCurrentDashboard = true;
    component.onSetDashboard(mouseEvent());
    expect(emitted).toHaveBeenCalledTimes(1);
    expect(emitted).toHaveBeenCalledWith(component.dashboardMenuItem);
  });

  it('emits submenu selection and tracks it by ID', () => {
    const component = new DashboardSubMenuComponent();
    const child = dashboardMenu({ id: 'child' });
    const emitted = jest.fn();
    component.setCurrentDashboardSubMenu.subscribe(emitted);

    component.onSetCurrentDashboardSubMenu(mouseEvent(), child);
    expect(emitted).toHaveBeenCalledWith(child);
    expect(component.trackById(0, child)).toBe('child');
  });

  it('removes only the selected summary dimension', () => {
    const component = new DashboardSelectionSummaryComponent();
    component.globalSelection = {
      default: false, dataSelections: [periodSelection(), orgUnitSelection()],
    };
    const emitted = jest.fn();
    component.removeSelection.subscribe(emitted);

    component.onRemoveSelection(mouseEvent(), 'pe');
    expect(emitted).toHaveBeenCalledWith([orgUnitSelection()]);
  });

});
