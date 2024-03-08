import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ErrorMessage } from '@iapps/ngx-dhis2-http-client';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { DashboardConfig, DashboardMenu } from '../../models';
import { DashboardConfigService, DashboardMenuService } from '../../services';
import { DashboardMenuActions } from '../actions';
import { D2DashboardMenuState } from '../reducers';

@Injectable()
export class DashboardMenuEffects {
  loadDashboardMenus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardMenuActions.loadDashboardMenus),
      switchMap(() => {
        const config: DashboardConfig = this.dashboardConfigService.getConfig();
        return this.dashboarMenuService.findMenuList(config).pipe(
          map((dashboardMenus) =>
            DashboardMenuActions.saveDashboardMenus({ dashboardMenus })
          ),
          catchError((loadingError: ErrorMessage) =>
            of(DashboardMenuActions.loadDashboardMenusFailed({ loadingError }))
          )
        );
      })
    )
  );

  saveDashboardMenus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardMenuActions.saveDashboardMenus),
      switchMap(({ dashboardMenus }) => {
        const splitedUrl = (window.location.href || '').split('/');
        const { selectedDashboardMenu, selectedDashboardSubMenu } =
          DashboardMenu.getCurrentDashboardMenu(
            dashboardMenus,
            splitedUrl[splitedUrl.indexOf('dashboard') + 1]
          );

        return [
          DashboardMenuActions.setCurrentDashboardMenu({
            selectedDashboardMenu,
            selectedDashboardSubMenu,
          }),
        ];
      })
    )
  );

  setCurrrenDashboardMenu$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DashboardMenuActions.setCurrentDashboardMenu),
        tap(({ selectedDashboardMenu, selectedDashboardSubMenu }) => {
          const config: DashboardConfig =
            this.dashboardConfigService.getConfig();

          const currentDashboardSubMenu =
            selectedDashboardSubMenu ||
            (selectedDashboardMenu?.subMenus || [])[0];

          if (currentDashboardSubMenu) {
            this.d2DashboardMenuStore.dispatch(
              DashboardMenuActions.setCurrentDashboardSubMenu({
                selectedDashboardSubMenu: currentDashboardSubMenu,
              })
            );
          } else if (selectedDashboardMenu) {
            this._snackBarRef = this._snackBar.open(
              `Loading ${selectedDashboardMenu?.name} Dashboard`,
              '',
              { duration: 5000 }
            );
            this.router.navigate([config.rootUrl, selectedDashboardMenu?.id]);
          }
        })
      ),
    { dispatch: false }
  );

  setCurrentDashboardSubMenu$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DashboardMenuActions.setCurrentDashboardSubMenu),
        tap(({ selectedDashboardSubMenu }) => {
          const config: DashboardConfig =
            this.dashboardConfigService.getConfig();
          this._snackBarRef = this._snackBar.open(
            `Loading ${selectedDashboardSubMenu.name} Dashboard`,
            '',
            { duration: 5000 }
          );
          this.router.navigate([config.rootUrl, selectedDashboardSubMenu.id]);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private d2DashboardMenuStore: Store<D2DashboardMenuState>,
    private dashboarMenuService: DashboardMenuService,
    private dashboardConfigService: DashboardConfigService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private _snackBarRef: MatSnackBarRef<TextOnlySnackBar>
  ) {}

  // ngrxOnInitEffects(): Action {
  //   return
  // }
}
