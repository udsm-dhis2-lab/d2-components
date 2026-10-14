import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { CommonModule } from '@angular/common';
import {
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs';
import { CurrentDashboardHeaderComponent } from '../../components/current-dashboard-header/current-dashboard-header.component';
import { DashboardItemsComponent } from '../../components/dashboard-items/dashboard-items.component';
import { DashboardSelectionSummaryComponent } from '../../components/dashboard-selection-summary/dashboard-selection-summary.component';
import {
  DashboardSelectionConfig,
  VisualizationDataSelection,
} from '../../models';
import { DashboardConfigService, DashboardService } from '../../services';
import { DashboardStateFacade } from '../../state';

@Component({
    imports: [
        CommonModule,
        DashboardItemsComponent,
        CurrentDashboardHeaderComponent,
        DashboardSelectionSummaryComponent,
    ],
    selector: 'd2-current-dashboard',
    templateUrl: './current-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./current-dashboard.component.scss']
})
export class CurrentDashboardComponent implements OnInit {
  private injector = inject(Injector);
  currentDashboard = this.dashboardState.activeDashboard;
  globalSelection = this.dashboardState.activeSelection;
  error = computed(() => this.dashboardState.errors().dashboard);
  loading = computed(() => this.dashboardState.loading().dashboard);
  selectionConfig?: DashboardSelectionConfig;

  constructor(
    private dashboardService: DashboardService,
    private dashboardConfig: DashboardConfigService,
    private dashboardState: DashboardStateFacade,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.selectionConfig = this.dashboardConfig.getConfig()?.selectionConfig;

    toObservable(this.dashboardState.activeDashboardId, {
      injector: this.injector,
    })
      .pipe(
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        switchMap((id) => this.dashboardService.getCurrentDashboard(id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onSetGlobalFilter(dataSelections: VisualizationDataSelection[], id: string) {
    this.dashboardState.setDashboardSelection(id, dataSelections);
  }
}
