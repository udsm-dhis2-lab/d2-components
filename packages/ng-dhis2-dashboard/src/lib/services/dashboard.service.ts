import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { computed, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { D2Window } from '@iapps/d2-web-sdk';
import { Period } from '@iapps/period-utilities';
import {
  catchError,
  distinctUntilChanged,
  from,
  map,
  Observable,
  of,
  tap,
} from 'rxjs';
import { DashboardLoaderComponent } from '../components/dashboard-loader/dashboard-loader.component';
import {
  Dashboard,
  DashboardConfig,
  DashboardMenuObject,
  DashboardObject,
  DashboardSelectionConfig,
} from '../models';
import { DashboardStateFacade } from '../state';
import { DashboardConfigService } from './dashboard-config.service';

@Injectable()
export class DashboardService {
  private _overlayRef?: OverlayRef;
  private _firstTimeLoad = true;

  constructor(
    private router: Router,
    private _snackBar: MatSnackBar,
    private _snackBarRef: MatSnackBarRef<TextOnlySnackBar>,
    private overlay: Overlay,
    private dashboardConfigService: DashboardConfigService,
    private dashboardState: DashboardStateFacade
  ) {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    this.dashboardState.setStartupSelections(
      this._getStartUpDataSelections(config)
    );
  }

  currentDashboardId = computed(
    () => this.dashboardState.activeDashboardId() ?? undefined
  );

  currentDashboardId$ = toObservable(this.currentDashboardId);

  getCurrentDashboard(id: string): Observable<DashboardObject | undefined> {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    this._detachOverlay();
    this._attachOverlay();
    this.dashboardState.beginDashboardLoad(id);

    return (
      config?.useDataStore
        ? this._findByIdFromDataStore(id, config)
        : this._findByIdFromApi(id)
    ).pipe(
      tap((dashboard: DashboardObject) => {
        this.dashboardState.setDashboard(dashboard);
        if (dashboard && dashboard.selectionConfig) {
          const dataSelections = this._getStartUpDataSelections({
            rootUrl: '',
            selectionConfig: dashboard.selectionConfig,
          });
          this.dashboardState.setStartupSelections(dataSelections, id);
        } else {
          this.dashboardState.ensureDashboardSelection(id);
        }

        this._detachOverlay();
        if (!this._firstTimeLoad) {
          this._snackBarRef.dismiss();
        }
      }),
      catchError((error) => {
        this.dashboardState.failDashboardLoad(error);
        this._detachOverlay();
        this._snackBarRef = this._snackBar.open(
          `There was a problem loading dashboard of ID: ${id}`,
          'OK'
        );
        return of(undefined);
      })
    );
  }

  async setCurrentDashboard(currentDashboardMenu: DashboardMenuObject) {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    if (this._firstTimeLoad) {
      this._snackBarRef = this._snackBar.open(
        `Loading ${currentDashboardMenu.name} Dashboard`,
        '',
        { duration: 5000 }
      );
      this._firstTimeLoad = false;
    } else {
      this._snackBarRef = this._snackBar.open(
        `Loading ${currentDashboardMenu.name} Dashboard`,
        '',
        { duration: 5000 }
      );
    }

    this.dashboardState.activateDashboard(currentDashboardMenu.id);
    this.dashboardState.ensureDashboardSelection(currentDashboardMenu.id);

    this.router.navigate([
      config.rootUrl,
      'ng-dashboard-view',
      currentDashboardMenu.id,
    ]);
  }

  getCurrentDashboardId(): Observable<string | undefined> {
    return this.currentDashboardId$.pipe(distinctUntilChanged());
  }

  private _findByIdFromApi(id: string) {
    const d2 = (window as unknown as D2Window).d2Web;
    return from(
      d2.httpInstance.get(
        `dashboards/${id}.json?fields=id,name,description,favorite,dashboardItems[id,type,x,y,height,width,shape,visualization[id],chart~rename(visualization),map[id]]`
      )
    ).pipe(
      map((dashboardResponse) =>
        new Dashboard(
          dashboardResponse.data as Record<string, unknown>
        ).toObject()
      )
    );
  }

  private _findByIdFromDataStore(id: string, config: DashboardConfig) {
    const d2 = (window as unknown as D2Window).d2Web;
    return from(
      d2.httpInstance.get(`dataStore/${config.dataStoreNamespace}/${id}`)
    ).pipe(
      map((dashboardResponse) =>
        new Dashboard(
          dashboardResponse.data as Record<string, unknown>
        ).toObject()
      )
    );
  }

  private _attachOverlay() {
    this._overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });
    this._overlayRef.attach(new ComponentPortal(DashboardLoaderComponent));
  }

  private _detachOverlay() {
    this._overlayRef?.detach();
  }

  private _getStartUpDataSelections(config: DashboardConfig) {
    const selectionConfig: DashboardSelectionConfig | undefined =
      config?.selectionConfig;

    if (!selectionConfig?.allowSelectionOnStartUp) {
      return [];
    }

    const periodInstance = (new Period()
      .setType(selectionConfig.startUpPeriodType)
      .setPreferences({
        openFuturePeriods:
          selectionConfig?.periodConfig?.openFuturePeriods || 0,
      })
      .get()
      .list() || [])[0];

    return [
      {
        dimension: 'pe',
        items: [periodInstance],
      },
    ];
  }
}
