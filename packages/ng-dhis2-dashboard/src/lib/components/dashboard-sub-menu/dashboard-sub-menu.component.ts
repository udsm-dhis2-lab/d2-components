/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { DashboardMenuObject } from '../../models';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  imports: [MatTooltipModule],
  selector: 'd2-dashboard-sub-menu',
  templateUrl: './dashboard-sub-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  trackById = (_: number, item: any) => item?.id;
}
