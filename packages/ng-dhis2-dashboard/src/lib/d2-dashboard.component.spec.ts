import { dashboardMenu } from '../testing/dashboard.fixtures';
import { D2DashboardComponent } from './d2-dashboard.component';
import { DashboardMenuService } from './services';

describe('D2DashboardComponent', () => {
  it('loads menus on initialization and forwards menu actions', () => {
    const facade = {
      load: jest.fn(), setCurrentDashboardMenu: jest.fn(),
      setCurrentSubDashboard: jest.fn(),
    } as unknown as DashboardMenuService;
    const component = new D2DashboardComponent(facade);
    const menu = dashboardMenu();

    component.ngOnInit();
    component.onSetCurrentDashboard(menu);
    component.onSetCurrentSubDashboard(menu);

    expect(facade.load).toHaveBeenCalled();
    expect(facade.setCurrentDashboardMenu).toHaveBeenCalledWith(menu);
    expect(facade.setCurrentSubDashboard).toHaveBeenCalledWith(menu);
  });
});
