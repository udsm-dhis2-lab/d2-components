import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { switchMap } from 'rxjs';
import { DashboardConfig } from '../../models';
import { DashboardConfigService } from '../../services';
import { DataSelectionUtil } from '../../utilities/data-selection.util';
import { DashboardSelectionActions } from '../actions/dashboard-selection.actions';

@Injectable()
export class DashboardSelectionEffects implements OnInitEffects {
  setStartUpSelection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardSelectionActions.getStartupSelections),
      switchMap(() => {
        const config: DashboardConfig = this.dashboardConfigService.getConfig();
        return [
          DashboardSelectionActions.setStartupSelections({
            startUpDataSelections: config?.selectionConfig
              ? DataSelectionUtil.getStartUpSelections(config.selectionConfig)
              : {},
          }),
        ];
      })
    )
  );
  constructor(
    private actions$: Actions,
    private dashboardConfigService: DashboardConfigService
  ) {}
  ngrxOnInitEffects(): Action {
    return DashboardSelectionActions.getStartupSelections();
  }
}
