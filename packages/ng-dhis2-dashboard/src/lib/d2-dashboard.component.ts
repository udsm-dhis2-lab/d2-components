import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardMenuComponent } from './components/dashboard-menu/dashboard-menu.component';
import { DashboardMenuObject } from './models';
import { DashboardMenuService } from './services';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'd2-dashboard',
    imports: [CommonModule, RouterModule, DashboardMenuComponent],
    templateUrl: './d2-dashboard.component.html',
    styleUrls: ['./d2-dashboard.component.scss']
})
export class D2DashboardComponent implements OnInit {
  dashboardMenuFacade: DashboardMenuService;

  constructor(dashboardMenuService: DashboardMenuService) {
    this.dashboardMenuFacade = dashboardMenuService;
  }

  ngOnInit() {
    this.dashboardMenuFacade.load();
  }

  onSetCurrentDashboard(selectedDashboardMenu: DashboardMenuObject) {
    this.dashboardMenuFacade.setCurrentDashboardMenu(selectedDashboardMenu);
  }

  onSetCurrentSubDashboard(selectedDashboardSubMenu: DashboardMenuObject) {
    this.dashboardMenuFacade.setCurrentSubDashboard(selectedDashboardSubMenu);
  }
}
