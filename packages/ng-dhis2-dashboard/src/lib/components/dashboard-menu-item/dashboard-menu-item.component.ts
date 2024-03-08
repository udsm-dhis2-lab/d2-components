import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashboardMenuObject } from '../../models';

@Component({
  selector: 'd2-dashboard-menu-item',
  templateUrl: './dashboard-menu-item.component.html',
  styleUrls: ['./dashboard-menu-item.component.scss'],
})
export class DashboardMenuItemComponent {
  @Input() dashboardMenuItem!: DashboardMenuObject;
  @Input() isCurrentDashboard?: boolean;
  @Output() setDashboard: EventEmitter<DashboardMenuObject> =
    new EventEmitter<DashboardMenuObject>();

  onSetDashboard(e: MouseEvent) {
    e.stopPropagation();
    if (!this.isCurrentDashboard) {
      this.setDashboard.emit(this.dashboardMenuItem);
    }
  }
}
