import { Component, Input, OnInit } from '@angular/core';
import { ErrorMessage } from '@iapps/ngx-dhis2-http-client';
import { select, Store } from '@ngrx/store';
import { catchError, Observable, of, tap } from 'rxjs';
import { DashboardMenuObject } from './models';
import { DashboardService } from './services';
import {
  D2DashboardMenuState,
  DashboardMenuActions,
  getAllDashboardMenus,
  getDashboardMenuLoadedStatus,
  getDashboardMenuLoadingStatus,
  getDashboardMenuLoadingStatusErrorMessage,
  getSelectedDashboardMenu,
  getSelectedDashboardSubMenu,
} from './store';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'd2-dashboard',
  templateUrl: './d2-dashboard.component.html',
  styleUrls: ['./d2-dashboard.component.scss'],
})
export class D2DashboardComponent implements OnInit {
  dashboardMenuList$!: Observable<DashboardMenuObject[]>;
  dashboardMenuLoaded$!: Observable<boolean>;
  dashboardMenuLoading$!: Observable<boolean>;
  dashboardMenuLoadingError$!: Observable<ErrorMessage>;
  currentDashboardMenu$?: Observable<DashboardMenuObject | undefined>;
  currentDashboardSubMenu$?: Observable<DashboardMenuObject | undefined>;

  constructor(private d2DashboardMenuStore: Store<D2DashboardMenuState>) {}

  ngOnInit() {
    this.d2DashboardMenuStore.dispatch(
      DashboardMenuActions.loadDashboardMenus()
    );
    this.dashboardMenuList$ = this.d2DashboardMenuStore.pipe(
      select(getAllDashboardMenus)
    );
    this.dashboardMenuLoaded$ = this.d2DashboardMenuStore.pipe(
      select(getDashboardMenuLoadedStatus)
    );
    this.dashboardMenuLoading$ = this.d2DashboardMenuStore.pipe(
      select(getDashboardMenuLoadingStatus)
    );
    this.dashboardMenuLoadingError$ = this.d2DashboardMenuStore.pipe(
      select(getDashboardMenuLoadingStatusErrorMessage)
    );
    this.currentDashboardMenu$ = this.d2DashboardMenuStore.pipe(
      select(getSelectedDashboardMenu)
    );

    this.currentDashboardSubMenu$ = this.d2DashboardMenuStore.pipe(
      select(getSelectedDashboardSubMenu)
    );
  }

  onSetCurrentDashboard(selectedDashboardMenu: DashboardMenuObject) {
    this.d2DashboardMenuStore.dispatch(
      DashboardMenuActions.setCurrentDashboardMenu({ selectedDashboardMenu })
    );
  }

  onSetCurrentSubDashboard(selectedDashboardSubMenu: DashboardMenuObject) {
    this.d2DashboardMenuStore.dispatch(
      DashboardMenuActions.setCurrentDashboardSubMenu({
        selectedDashboardSubMenu,
      })
    );
  }
}
