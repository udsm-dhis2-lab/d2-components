import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxPrintModule } from 'ngx-print';
import {
  DashboardObject,
  DashboardSelectionConfig,
  VisualizationDataSelection,
} from '../../models';
import { DashboardSelectionFiltersComponent } from '../../modules/dashboard-selection-filters/dashboard-selection-filters.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NgxPrintModule,
    DashboardSelectionFiltersComponent,
  ],
  selector: 'd2-current-dashboard-header',
  templateUrl: './current-dashboard-header.component.html',
  styleUrls: ['./current-dashboard-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentDashboardHeaderComponent {
  @Input() dashboard!: Partial<DashboardObject>;
  @Input() selectionConfig?: DashboardSelectionConfig;
  @Input() dataSelections: VisualizationDataSelection[] = [];

  @Output() setGlobalFilter = new EventEmitter<VisualizationDataSelection[]>();

  onFilterSelection(selectedFilters: VisualizationDataSelection[]) {
    this.setGlobalFilter.emit(selectedFilters);
  }
}
