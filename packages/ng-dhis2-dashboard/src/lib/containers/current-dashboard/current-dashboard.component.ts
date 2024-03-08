import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';

import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import {
  DashboardObject,
  DashboardSelectionConfig,
  VisualizationDataSelection,
} from '../../models';
import { IGlobalSelection } from '../../models/global-selection.model';
import { DashboardConfigService, DashboardService } from '../../services';
import { D2DashboardSelectionState } from '../../store';
import { DashboardSelectionActions } from '../../store/actions/dashboard-selection.actions';
import { getDashboardSelectionById } from '../../store/selectors/dashboard-selection.selectors';

@Component({
  selector: 'd2-current-dashboard',
  templateUrl: './current-dashboard.component.html',
  styleUrls: ['./current-dashboard.component.scss'],
})
export class CurrentDashboardComponent implements OnInit {
  currentDashboard$?: Observable<DashboardObject | undefined>;
  globalSelection$!: Observable<IGlobalSelection | undefined>;
  error?: object;
  loading = true;
  selectionConfig?: DashboardSelectionConfig;
  constructor(
    private dashboardService: DashboardService,
    private activatedRoute: ActivatedRoute,
    private dashboardConfig: DashboardConfigService,
    private dashboardSelectionStore: Store<D2DashboardSelectionState>
  ) {}

  ngOnInit() {
    this.selectionConfig = this.dashboardConfig.getConfig()?.selectionConfig;

    this.currentDashboard$ = this.activatedRoute.params.pipe(
      switchMap(({ id }) => {
        this.loading = true;
        this.globalSelection$ = this.dashboardSelectionStore.pipe(
          select(getDashboardSelectionById(id))
        );
        return this.dashboardService.getCurrentDashboard(id);
      }),
      tap(() => {
        this.loading = false;
      }),
      catchError((error) => {
        this.error = error;
        this.loading = false;
        return of(undefined);
      })
    );
  }

  onSetGlobalFilter(dataSelections: VisualizationDataSelection[], id: string) {
    this.dashboardSelectionStore.dispatch(
      DashboardSelectionActions.setDashboardSelection({
        dataSelections,
        dashboardId: id,
      })
    );
    this.globalSelection$ = this.dashboardSelectionStore.pipe(
      select(getDashboardSelectionById(id))
    );
  }
}
