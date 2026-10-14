import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUser, D2Window } from '@iapps/d2-web-sdk';
import { from, map, Observable, of, switchMap, tap, zip } from 'rxjs';
import { DashboardConfig, DashboardMenu, DashboardMenuObject } from '../models';
import { userAuthorizedDashboards } from '../utilities/access-control.util';
import { DashboardConfigService } from './dashboard-config.service';
import { DashboardStateFacade } from '../state';

@Injectable()
export class DashboardMenuService {
  #router = inject(Router);
  constructor(
    private dashboardConfigService: DashboardConfigService,
    private dashboardState: DashboardStateFacade
  ) {}

  loading = computed(() => this.dashboardState.loading().menus);

  dashboardMenus = computed(() => [...this.dashboardState.menus()]);

  currentDashboardMenu = this.dashboardState.selectedMenu;

  currentDashboardSubMenu = this.dashboardState.selectedSubMenu;

  loadingError = computed(() => {
    const error = this.dashboardState.errors().menus;
    return (
      error instanceof Error ? error : error ? new Error(String(error)) : null
    ) as any;
  });

  load(): void {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    this.dashboardState.beginMenuLoad();

    this.findMenuList(config).subscribe({
      next: (dashboardMenus) => {
        const splitedUrl = (window.location.href || '').split('/');
        const { selectedDashboardMenu, selectedDashboardSubMenu } =
          DashboardMenu.getCurrentDashboardMenu(
            dashboardMenus,
            splitedUrl[splitedUrl.indexOf('ng-dashboard-view') + 1]
          );

        this.dashboardState.setMenus(
          dashboardMenus,
          selectedDashboardMenu?.id || null,
          selectedDashboardSubMenu?.id || null
        );

        if (selectedDashboardMenu || selectedDashboardSubMenu) {
          this.#router.navigate([
            config.rootUrl,
            'ng-dashboard-view',
            selectedDashboardSubMenu?.id || selectedDashboardMenu?.id,
          ]);
        }
      },
      error: (error) => {
        this.dashboardState.failMenuLoad(error);
      },
    });
  }

  getMenus(): Observable<DashboardMenuObject[]> {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    // this._detachOverlay();
    // this._attachOverlay();
    return this.findMenuList(config as DashboardConfig).pipe(
      tap((dashboardMenuItems: DashboardMenuObject[]) => {
        // this._detachOverlay();
        // const splitedUrl = (window.location.href || '').split('/');
        // const currentDashboard =
        //   find(dashboardMenuItems, [
        //     'id',
        //     splitedUrl[splitedUrl.indexOf('dashboard') + 1],
        //   ]) || dashboardMenuItems[0];
        // this.setCurrentDashboard(currentDashboard);
      })
    );
  }

  findMenuList(config: DashboardConfig): Observable<DashboardMenuObject[]> {
    return (
      config?.useDataStore
        ? this.#findAllFromDataStore(config)
        : this.#findAllFromApi()
    ).pipe(
      map((res: any) => {
        return (res?.dashboards || []).map(
          (dashboard: { [key: string]: string | number | object }) =>
            new DashboardMenu(dashboard).toObject()
        );
      })
    );
  }

  setCurrentDashboardMenu(selectedDashboardMenu: DashboardMenuObject) {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();

    const selectedDashboardSubMenu = (selectedDashboardMenu.subMenus || [])[0];

    this.dashboardState.selectMenu(
      selectedDashboardMenu.id,
      selectedDashboardSubMenu?.id || null
    );

    this.#router.navigate([
      config.rootUrl,
      'ng-dashboard-view',
      selectedDashboardSubMenu?.id || selectedDashboardMenu.id,
    ]);
  }

  setCurrentSubDashboard(selectedDashboardSubMenu: DashboardMenuObject) {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();

    const parent = this.dashboardMenus().find((menu) =>
      menu.subMenus?.some(
        (subMenu) => subMenu.id === selectedDashboardSubMenu.id
      )
    );
    if (parent) {
      this.dashboardState.selectMenu(parent.id, selectedDashboardSubMenu.id);
    } else {
      this.dashboardState.activateDashboard(selectedDashboardSubMenu.id);
    }
    this.#router.navigate([config.rootUrl, selectedDashboardSubMenu.id]);
  }

  #findAllFromApi(): Observable<any> {
    const d2 = (window as unknown as D2Window).d2Web;
    return from(
      d2.httpInstance.get('dashboards.json?fields=id,name&paging=false')
    ).pipe(map((res) => res.data));
  }

  #findAllFromDataStore(config: DashboardConfig) {
    const d2 = (window as unknown as D2Window).d2Web;
    return of(d2.currentUser).pipe(
      switchMap((user) => {
        return zip(
          from(
            d2.httpInstance.get(
              `dataStore/${config.dataStoreNamespace}/summary`
            )
          )
        ).pipe(
          map((response) => {
            return {
              dashboards: userAuthorizedDashboards(
                (response[0]?.data as unknown as DashboardMenuObject[]) || [],
                user as CurrentUser
              ),
            };
          })
        );
      })
    );
  }
}
