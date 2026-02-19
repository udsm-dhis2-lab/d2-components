/* eslint-disable @typescript-eslint/no-empty-function */
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
import { CommonModule } from '@angular/common';
import { ReactWrapperModule } from '@iapps/ng-dhis2-ui';
import { DashboardSubMenuComponent } from '../dashboard-sub-menu/dashboard-sub-menu.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  imports: [
    CommonModule,
    ReactWrapperModule,
    DashboardSubMenuComponent,
    MatDividerModule,
  ],
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
  onResize() {}

  // DashboardMenu: any;

  constructor() {}

  ngOnInit() {
    // this.DashboardMenu = () => {
    //   const [currentMenu, setCurrentMenu] = useState(
    //     this.currentDashboardMenu?.id
    //   );
    //   return (
    //     <TabBar scrollable>
    //       {this.dashboardMenuItems.map((dashboardMenuItem) => (
    //         <Tab
    //           key={dashboardMenuItem.id}
    //           selected={currentMenu === dashboardMenuItem.id}
    //           onClick={() => {
    //             setCurrentMenu(dashboardMenuItem.id);
    //             this.onSetCurrentDashboard(dashboardMenuItem);
    //           }}
    //         >
    //           {dashboardMenuItem.name}
    //         </Tab>
    //       ))}
    //     </TabBar>
    //   );
    // };
  }
  
  ngAfterViewInit(): void {
    this.dashboardMenuWidth = document.getElementById(
      'd2_dashboard__menu_list'
    )?.clientWidth;
  }

  DashboardMenu = () => {
    // const selectedId = this.currentDashboardMenu?.id;

    // return (
    //   <div className="d2DashMenu">
    //     <TabBar scrollable>
    //       {this.dashboardMenuItems.map((item) => {
    //         const isSelected = selectedId === item.id;

    //         return (
    //           <Tab
    // //           key={dashboardMenuItem.id}
    // //           selected={currentMenu === dashboardMenuItem.id}
    // //           onClick={() => {
    // //             setCurrentMenu(dashboardMenuItem.id);
    // //             this.onSetCurrentDashboard(dashboardMenuItem);
    // //           }}
    // //         >
    //           // <Tab
    //           //   key={item.id}
    //           //   selected={isSelected}
    //           //   onClick={() => this.handleDashboardClick(item)}
    //           //   title={item.name} // native tooltip fallback
    //           // >
    //           //   <span className="d2DashMenu__label">{item.name}</span>
    //           // </Tab>
    //           // <Tab
    //           //   key={item.id}
    //           //   selected={isSelected}
    //           //   disabled={this.isSwitchingDashboard}
    //           //   onClick={() => this.handleDashboardClick(item)}
    //           // >
    //           //   <span className="d2DashMenu__label">{item.name}</span>
    //           //   {isSelected && this.isSwitchingDashboard ? (
    //           //     <span className="d2DashMenu__dot" aria-hidden="true" />
    //           //   ) : null}
    //           // </Tab>
    //         );
    //       })}
    //     </TabBar>
    //   </div>
    // );

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

  private isSwitchingDashboard = false;

  handleDashboardClick(item: any): void {
    const currentId = this.currentDashboardMenu?.id;

    if (!item?.id || item.id === currentId || this.isSwitchingDashboard) return;

    this.isSwitchingDashboard = true;

    try {
      this.onSetCurrentDashboard(item);
    } finally {
      // if onSetCurrentDashboard is async, move this to completion callback
      setTimeout(() => (this.isSwitchingDashboard = false), 250);
    }
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
