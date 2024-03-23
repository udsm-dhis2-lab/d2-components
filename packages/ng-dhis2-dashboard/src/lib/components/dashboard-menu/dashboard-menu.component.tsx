import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { DashboardMenuObject } from '../../models';
import React, { useState } from 'react';
import { TabBar, Tab } from '@dhis2/ui';

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

  DashboardMenu: any;

  constructor() {}

  ngOnInit() {
    this.DashboardMenu = () => {
      const [currentMenu, setCurrentMenu] = useState(
        this.currentDashboardMenu?.id
      );
      return (
        <TabBar scrollable>
          {this.dashboardMenuItems.map((dashboardMenuItem) => (
            <Tab
              key={dashboardMenuItem.id}
              selected={currentMenu === dashboardMenuItem.id}
              onClick={() => {
                setCurrentMenu(dashboardMenuItem.id);
                this.onSetCurrentDashboard(dashboardMenuItem);
              }}
            >
              {dashboardMenuItem.name}
            </Tab>
          ))}
        </TabBar>
      );
    };
  }
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
