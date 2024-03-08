import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { DashboardMenuObject } from '../../models';

@Component({
  selector: 'd2-dashboard-menu',
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.scss'],
})
export class DashboardMenuComponent implements AfterViewInit {
  @Input() dashboardMenuItems!: DashboardMenuObject[];
  @Input() currentDashboardMenu?: DashboardMenuObject;
  @Input() currentDashboardSubMenu?: DashboardMenuObject;

  searchTerm?: string;
  dashboardMenuWidth?: number;

  @Output() setCurrentDashboard: EventEmitter<DashboardMenuObject> =
    new EventEmitter<DashboardMenuObject>();

  @Output() setCurrentSubDashboard: EventEmitter<DashboardMenuObject> =
    new EventEmitter<DashboardMenuObject>();

  @HostListener('window:resize')
  onResize() {
    // console.log(
    //   this.dashboardMenuWidth,
    //   document.getElementById('d2_dashboard__menu_list')?.clientWidth
    // );
  }

  constructor() {}
  ngAfterViewInit(): void {
    this.dashboardMenuWidth = document.getElementById(
      'd2_dashboard__menu_list'
    )?.clientWidth;
  }

  onSetCurrentDashboard(dashboardMenuItem: DashboardMenuObject) {
    this.setCurrentDashboard.emit(dashboardMenuItem);
  }

  onSearchDashboard(e: KeyboardEvent) {
    e.stopPropagation();
    this.searchTerm = (e.target as any)?.value;
  }

  onSetCurrentDashboardSubMenu(dashboardSubMenu: DashboardMenuObject) {
    this.setCurrentSubDashboard.emit(dashboardSubMenu);
  }
}
