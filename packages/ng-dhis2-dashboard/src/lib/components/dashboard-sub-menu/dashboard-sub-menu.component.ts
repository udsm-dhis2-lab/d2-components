import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardMenuObject } from '../../models';

@Component({
  selector: 'd2-dashboard-sub-menu',
  templateUrl: './dashboard-sub-menu.component.html',
  styleUrls: ['./dashboard-sub-menu.component.scss'],
})
export class DashboardSubMenuComponent implements OnInit {
  @Input() dashboardSubMenus!: DashboardMenuObject[];
  @Input() curentDashboardSubMenu?: DashboardMenuObject;

  @Output() setCurrentDashboardSubMenu: EventEmitter<DashboardMenuObject> =
    new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onSetCurrentDashboardSubMenu(
    event: MouseEvent,
    dashboardSubMenu: DashboardMenuObject
  ) {
    event.stopPropagation();
    this.setCurrentDashboardSubMenu.emit(dashboardSubMenu);
  }
}
