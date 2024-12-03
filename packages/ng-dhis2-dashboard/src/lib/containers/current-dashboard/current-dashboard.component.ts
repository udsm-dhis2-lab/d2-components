import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { CommonModule } from '@angular/common';
import { isUndefined } from 'lodash';
import {
  catchError,
  distinctUntilChanged,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { CurrentDashboardHeaderComponent } from '../../components/current-dashboard-header/current-dashboard-header.component';
import { DashboardItemsComponent } from '../../components/dashboard-items/dashboard-items.component';
import { DashboardSelectionSummaryComponent } from '../../components/dashboard-selection-summary/dashboard-selection-summary.component';
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
  standalone: true,
  imports: [
    CommonModule,
    DashboardItemsComponent,
    CurrentDashboardHeaderComponent,
    DashboardSelectionSummaryComponent,
  ],
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
    private dashboardConfig: DashboardConfigService,
    private dashboardSelectionStore: Store<D2DashboardSelectionState>
  ) {}

  ngOnInit() {
    this.selectionConfig = this.dashboardConfig.getConfig()?.selectionConfig;

    this.currentDashboard$ = this.dashboardService.currentDashboardId$.pipe(
      filter((dashboard) => !isUndefined(dashboard)),
      switchMap((id) => {
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
