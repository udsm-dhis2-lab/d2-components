import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { keys } from 'lodash';
import {
  DashboardAdditionalFilter,
  DashboardSelectionConfig,
  VisualizationDataSelection,
  VisualizationDataSelectionItem,
} from '../../models';
import { AdditionalFilterDialogComponent } from './dialogs/additional-filter-dialog/additional-filter-dialog.component';
import { OrgUnitFilterDialogComponent } from './dialogs/org-unit-filter-dialog/org-unit-filter-dialog.component';
import { PeriodFilterDialogComponent } from './dialogs/period-filter-dialog/period-filter-dialog.component';

@Component({
  selector: 'd2-dashboard-selection-filters',
  templateUrl: './dashboard-selection-filters.component.html',
  styleUrls: ['./dashboard-selection-filters.component.scss'],
})
export class DashboardSelectionFiltersComponent {
  @Input() dataSelections!: VisualizationDataSelection[];
  @Input() additionalFilters?: DashboardAdditionalFilter[];
  @Input() selectionConfig?: DashboardSelectionConfig;

  selectionEntities: { [key: string]: object } = {};
  @Output() setFilterSelection = new EventEmitter<
    VisualizationDataSelection[]
  >();
  @ViewChild(MatMenuTrigger) menu!: MatMenuTrigger;
  constructor(private dialog: MatDialog) {}

  onOpenPeriodDialog(e: MouseEvent) {
    e.stopPropagation();
    this.menu.closeMenu();

    this._updateSelectionEntities();

    const periodDialog = this.dialog.open(PeriodFilterDialogComponent, {
      width: '800px',

      data: {
        periodConfig: this.selectionConfig?.periodConfig,
        selectedPeriods:
          this.dataSelections?.find((selection) => selection.dimension === 'pe')
            ?.items || [],
      },
    });

    periodDialog.afterClosed().subscribe((res) => {
      if (res?.action === 'UPDATE') {
        this.selectionEntities = {
          ...this.selectionEntities,
          pe: res?.periodObject?.items || [],
        };

        this.setFilterSelection.emit(this._getVisualizationSelections());
      }
    });
  }

  onOpenOrgUnitDialog(e: MouseEvent) {
    e.stopPropagation();
    this.menu.closeMenu();

    this._updateSelectionEntities();

    const orgUnitDialog = this.dialog.open(OrgUnitFilterDialogComponent, {
      width: '800px',
      data: {
        selectedOrgUnits:
          this.dataSelections?.find((selection) => selection.dimension === 'ou')
            ?.items || [],
      },
    });

    orgUnitDialog.afterClosed().subscribe((res) => {
      if (res?.action === 'UPDATE') {
        this.selectionEntities = {
          ...this.selectionEntities,
          ou: res?.selectionItems?.items || [],
        };

        this.setFilterSelection.emit(this._getVisualizationSelections());
      }
    });
  }

  onOpenFilterDialog(
    e: MouseEvent,
    additionalFilter: DashboardAdditionalFilter
  ) {
    e.stopPropagation();
    this.menu.closeMenu();

    const orgUnitDialog = this.dialog.open(AdditionalFilterDialogComponent, {
      width: '800px',
      data: additionalFilter,
    });

    orgUnitDialog.afterClosed().subscribe((res) => {
      if (res) {
        this.selectionEntities = {
          ...this.selectionEntities,
          [additionalFilter.dimension]: res?.selectedOptions || [],
        };
        this.setFilterSelection.emit(this._getVisualizationSelections());
      }
    });
  }

  private _getVisualizationSelections(): VisualizationDataSelection[] {
    return keys(this.selectionEntities).map((dimensionKey: string) => {
      const additionalDimension = this.additionalFilters?.find(
        (additionalFilter) => additionalFilter.dimension === dimensionKey
      );
      return {
        dimension: dimensionKey,
        ...(additionalDimension || {}),
        items: this.selectionEntities[
          dimensionKey
        ] as VisualizationDataSelectionItem[],
      };
    });
  }

  private _updateSelectionEntities() {
    this.selectionEntities = this.dataSelections.reduce(
      (selectionEntity, dataSelection) => {
        return {
          ...selectionEntity,
          [dataSelection.dimension]: dataSelection.items || [],
        };
      },
      {}
    );
  }
}
