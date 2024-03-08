import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { map, Observable, of, switchMap, tap, zip } from 'rxjs';
import { DashboardConfig, DashboardMenu, DashboardMenuObject } from '../models';
import { DashboardConfigService } from './dashboard-config.service';
import { userAuthorizedDashboards } from '../utilities/access-control.util';

@Injectable()
export class DashboardMenuService {
  constructor(
    private dashboardConfigService: DashboardConfigService,
    private httpClient: NgxDhis2HttpClientService
  ) {}

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
        ? this._findAllFromDataStore(config)
        : this._findAllFromApi()
    ).pipe(
      map((res: any) => {
        return (res?.dashboards || []).map(
          (dashboard: { [key: string]: string | number | object }) =>
            new DashboardMenu(dashboard).toObject()
        );
      })
    );
  }

  private _findAllFromApi() {
    return this.httpClient.get('dashboards.json?fields=id,name&paging=false');
  }

  private _findAllFromDataStore(config: DashboardConfig) {
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
