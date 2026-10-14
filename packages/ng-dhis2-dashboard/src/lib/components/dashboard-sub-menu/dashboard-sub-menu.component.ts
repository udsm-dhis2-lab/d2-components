import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { DashboardMenuObject } from '../../models';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  imports: [MatTooltipModule],
  selector: 'd2-dashboard-sub-menu',
  templateUrl: './dashboard-sub-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard-sub-menu.component.scss'],
})
export class DashboardSubMenuComponent {
  @Input() dashboardSubMenus!: DashboardMenuObject[];
  @Input() curentDashboardSubMenu?: DashboardMenuObject;

  @Output() setCurrentDashboardSubMenu: EventEmitter<DashboardMenuObject> =
    new EventEmitter();
  onSetCurrentDashboardSubMenu(
    event: MouseEvent,
    dashboardSubMenu: DashboardMenuObject
  ) {
    event.stopPropagation();
    this.setCurrentDashboardSubMenu.emit(dashboardSubMenu);
  }

  trackById = (_: number, item: DashboardMenuObject) => item.id;
}
