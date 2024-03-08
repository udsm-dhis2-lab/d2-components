import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Period } from '@iapps/period-utilities';
import { BehaviorSubject, firstValueFrom, Observable, of, tap } from 'rxjs';
import { catchError, distinctUntilChanged, map, take } from 'rxjs/operators';
import { DashboardLoaderComponent } from '../components/dashboard-loader/dashboard-loader.component';
import { DIMENSION_LABELS } from '../constants/selection-dimension-label.constant';
import {
  Dashboard,
  DashboardConfig,
  DashboardMenuObject,
  DashboardObject,
  DashboardSelectionConfig,
  VisualizationDataSelection,
} from '../models';
import {
  GlobalSelection,
  IGlobalSelection,
} from '../models/global-selection.model';
import { DashboardConfigService } from './dashboard-config.service';
import { Store } from '@ngrx/store';
import { D2DashboardSelectionState } from '../store';
import { DashboardSelectionActions } from '../store/actions/dashboard-selection.actions';

interface DashboardStore {
  currentDashboardMenu?: DashboardMenuObject;
  globalSelections: {
    [id: string]: {
      default: boolean;
      dataSelections: VisualizationDataSelection[];
    };
  };
  startUpDataSelections: any;
}

@Injectable()
export class DashboardService {
  private _dashboardStore$: BehaviorSubject<DashboardStore>;
  private _dashboardStoreObservable$: Observable<DashboardStore>;
  private _overlayRef?: OverlayRef;
  private _firstTimeLoad = true;

  constructor(
    private httpClient: NgxDhis2HttpClientService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private _snackBarRef: MatSnackBarRef<TextOnlySnackBar>,
    private overlay: Overlay,
    private dashboardConfigService: DashboardConfigService,
    private dashboardSelectionStore: Store<D2DashboardSelectionState>
  ) {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    this._dashboardStore$ = new BehaviorSubject({
      globalSelections: {},
      startUpDataSelections: this._getStartUpDataSelections(config),
    });

    this._dashboardStoreObservable$ = this._dashboardStore$.asObservable();
  }

  getCurrentDashboard(id: string): Observable<DashboardObject | undefined> {
    const config: DashboardConfig = this.dashboardConfigService.getConfig();
    this._detachOverlay();
    this._attachOverlay();

    return (
      config?.useDataStore
        ? this._findByIdFromDataStore(id, config)
        : this._findByIdFromApi(id)
    ).pipe(
      tap(async (dashboard: DashboardObject) => {
        if (dashboard && dashboard.selectionConfig) {
          const dataSelections = this._getStartUpDataSelections({
            rootUrl: '',
            selectionConfig: dashboard.selectionConfig,
          });

          const dashboardStore = await firstValueFrom(
            this._dashboardStoreObservable$.pipe(take(1))
          );

          this._dashboardStore$.next({
            ...dashboardStore,
            globalSelections: {
              ...dashboardStore.globalSelections,
              [dashboard.id]: {
                default: true,
                dataSelections,
              },
            },
          });

          this.dashboardSelectionStore.dispatch(
            DashboardSelectionActions.setStartupSelections({
              startUpDataSelections: dataSelections,
              dashboardId: id,
            })
          );
        }

        this._detachOverlay();
        if (!this._firstTimeLoad) {
          this._snackBarRef.dismiss();
        }
      }),
      catchError((error) => {
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

    const dashboardStore = await firstValueFrom(
      this._dashboardStoreObservable$.pipe(take(1))
    );

    this._dashboardStore$.next({
      ...dashboardStore,
      currentDashboardMenu,
      globalSelections: {
        ...dashboardStore.globalSelections,
        [currentDashboardMenu.id]: dashboardStore.globalSelections[
          currentDashboardMenu.id
        ] || {
          default: true,
          dataSelections: dashboardStore.startUpDataSelections,
        },
      },
    });
    this.router.navigate([config.rootUrl, currentDashboardMenu.id]);
  }

  getCurrentDashboardId(): Observable<string | undefined> {
    return this._dashboardStoreObservable$.pipe(
      distinctUntilChanged(),
      map((dashboardStore) => dashboardStore?.currentDashboardMenu?.id)
    );
  }

  private _findByIdFromApi(id: string) {
    return this.httpClient
      .get(
        `dashboards/${id}.json?fields=id,name,description,favorite,dashboardItems[id,type,x,y,height,width,shape,visualization[id],chart~rename(visualization)]`
      )
      .pipe(
        map((dashboardResponse) => new Dashboard(dashboardResponse).toObject())
      );
  }

  private _findByIdFromDataStore(id: string, config: DashboardConfig) {
    return this.httpClient
      .get(`dataStore/${config.dataStoreNamespace}/${id}`)
      .pipe(
        map((dashboardResponse) => new Dashboard(dashboardResponse).toObject())
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
