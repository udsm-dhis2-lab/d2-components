import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUser, D2Window } from '@iapps/d2-web-sdk';
import { from, map, Observable, of, switchMap, tap, zip } from 'rxjs';
import { DashboardConfig, DashboardMenu, DashboardMenuObject } from '../models';
import { userAuthorizedDashboards } from '../utilities/access-control.util';
import { DashboardConfigService } from './dashboard-config.service';

interface D2DashboardMenuState {
  loading: boolean;
  loaded: boolean;
  loadingError: any | null;
  selectedDashboardMenuId: string | null;
  selectedDashboardSubMenuId: string | null;
  dashboardMenus: DashboardMenuObject[];
}

const initialState: D2DashboardMenuState = {
  loading: true,
  loaded: false,
  loadingError: null,
  selectedDashboardMenuId: null,
  selectedDashboardSubMenuId: null,
  dashboardMenus: [],
};

@Injectable()
export class DashboardMenuService {
  #dashboardMenuStore = signal<D2DashboardMenuState>(initialState);
  #router = inject(Router);
  constructor(private dashboardConfigService: DashboardConfigService) {}

  loading = computed(() => {
    return this.#dashboardMenuStore()?.loading;
  });

  dashboardMenus = computed(() => {
    return this.#dashboardMenuStore()?.dashboardMenus;
  });

  currentDashboardMenu = computed(() => {
    return this.dashboardMenus()?.find(
      (menu) => menu.id === this.#dashboardMenuStore()?.selectedDashboardMenuId
    );
  });

  currentDashboardSubMenu = computed(() => {
    return this.currentDashboardMenu()?.subMenus?.find(
      (menu) =>
        menu.id === this.#dashboardMenuStore()?.selectedDashboardSubMenuId
    );
  });

  loadingError = computed(() => {
    return this.#dashboardMenuStore()?.loadingError;
  });

  load(): void {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();

    this.findMenuList(config).subscribe({
      next: (dashboardMenus) => {
        const splitedUrl = (window.location.href || '').split('/');
        const { selectedDashboardMenu, selectedDashboardSubMenu } =
          DashboardMenu.getCurrentDashboardMenu(
            dashboardMenus,
            splitedUrl[splitedUrl.indexOf('ng-dashboard-view') + 1]
          );

        this.#dashboardMenuStore.update((state) => ({
          ...state,
          dashboardMenus,
          selectedDashboardMenuId: selectedDashboardMenu?.id as string,
          selectedDashboardSubMenuId: selectedDashboardSubMenu?.id || null,
          loading: false,
          loaded: true,
          loadingError: null,
        }));

        if (selectedDashboardMenu || selectedDashboardSubMenu) {
          this.#router.navigate([
            config.rootUrl,
            'ng-dashboard-view',
            selectedDashboardSubMenu?.id || selectedDashboardMenu?.id,
          ]);
        }
      },
      error: (error) => {
        this.#dashboardMenuStore.update((state) => ({
          ...state,
          loading: false,
          loaded: false,
          loadingError: error,
        }));
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

    this.#dashboardMenuStore.update((state) => ({
      ...state,
      selectedDashboardMenuId: selectedDashboardMenu.id,
      selectedDashboardSubMenuId: selectedDashboardSubMenu?.id || null,
    }));

    this.#router.navigate([
      config.rootUrl,
      'ng-dashboard-view',
      selectedDashboardSubMenu?.id || selectedDashboardMenu.id,
    ]);
  }

  setCurrentSubDashboard(selectedDashboardSubMenu: DashboardMenuObject) {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();

    this.#dashboardMenuStore.update((state) => ({
      ...state,
      selectedDashboardSubMenuId: selectedDashboardSubMenu.id,
    }));
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
