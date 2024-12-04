import { computed, inject, Injectable, signal } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { firstValueFrom, map, Observable, of, switchMap, tap, zip } from 'rxjs';
import { DashboardConfig, DashboardMenu, DashboardMenuObject } from '../models';
import { DashboardConfigService } from './dashboard-config.service';
import { userAuthorizedDashboards } from '../utilities/access-control.util';
import { Router } from '@angular/router';

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
  constructor(
    private dashboardConfigService: DashboardConfigService,
    private httpClient: NgxDhis2HttpClientService
  ) {}

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
            splitedUrl[splitedUrl.indexOf('dhis-dashboard-view') + 1]
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
            'dhis-dashboard-view',
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
      'dhis-dashboard-view',
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

  #findAllFromApi() {
    return this.httpClient.get('dashboards.json?fields=id,name&paging=false');
  }

  #findAllFromDataStore(config: DashboardConfig) {
    return this.httpClient.me().pipe(
      switchMap((user) => {
        return zip(
          this.httpClient.get(`dataStore/${config.dataStoreNamespace}/summary`)
        ).pipe(
          map((response) => {
            return {
              dashboards: userAuthorizedDashboards(response[0] || [], user),
            };
          })
        );
      })
    );
  }
}
