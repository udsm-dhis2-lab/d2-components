import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  DropdownButton,
  FlyoutMenu,
  IconClock16,
  IconDimensionOrgUnit16,
  IconFilter16,
  MenuItem,
  spacers,
} from '@dhis2/ui';
import { keys } from 'lodash';
import React from 'react';
import {
  DashboardAdditionalFilter,
  DashboardSelectionConfig,
  VisualizationDataSelection,
  VisualizationDataSelectionItem,
} from '../../models';
import { AdditionalFilterDialogComponent } from './dialogs/additional-filter-dialog/additional-filter-dialog.component';
import { CommonModule } from '@angular/common';
import {
  OrganisationUnitSelectorModule,
  PeriodSelectorModule,
  ReactWrapperModule,
} from '@iapps/ng-dhis2-ui';
import { DashboardSelectionFilterService } from './services/dashboard-selection-filter.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AdditionalFilterDialogComponent,
    OrganisationUnitSelectorModule,
    PeriodSelectorModule,
    ReactWrapperModule,
  ],
  providers: [DashboardSelectionFilterService],
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

  showPeriodSelector: WritableSignal<boolean> = signal(false);
  $showPeriodSelector = toObservable(this.showPeriodSelector);
  showOrgUnitSelector: WritableSignal<boolean> = signal(false);
  $showOrgUnitSelector = toObservable(this.showOrgUnitSelector);

  get selectedPeriods() {
    return (
      this.dataSelections.find(
        (dataSelection) => dataSelection.dimension === 'pe'
      )?.items || []
    );
  }

  get selectedOrgUnits() {
    return (
      this.dataSelections.find(
        (dataSelection) => dataSelection.dimension === 'ou'
      )?.items || []
    );
  }

  FilterButton = () => (
    <>
      <DropdownButton
        component={
          <FlyoutMenu dense>
            <MenuItem
              icon={<IconClock16 />}
              label="Period"
              onClick={() => {
                this.showPeriodSelector.set(true);
              }}
            />
            <MenuItem
              icon={<IconDimensionOrgUnit16 />}
              label="Organisation unit"
              onClick={() => {
                this.showOrgUnitSelector.set(true);
              }}
            />
          </FlyoutMenu>
        }
        name="dashboard-filters"
        value="dashboard-filters"
      >
        <IconFilter16 />
        <span style={{ marginLeft: spacers.dp8 }}>Add filter</span>
      </DropdownButton>
    </>
  );

  constructor(private dialog: MatDialog) {}

  onCancelPeriod() {
    this.showPeriodSelector.set(false);
  }

  onCancelOrgUnit() {
    this.showOrgUnitSelector.set(false);
  }

  onSelectPeriod(selectedPeriods: any[]) {
    this.showPeriodSelector.set(false);
    this.selectionEntities = {
      ...this.selectionEntities,
      pe: selectedPeriods,
    };

    this.setFilterSelection.emit(this._getVisualizationSelections());
  }

  onSelectOrgUnit(selectedOrgUnits: any[]) {
    this.showOrgUnitSelector.set(false);
    this.selectionEntities = {
      ...this.selectionEntities,
      ou: selectedOrgUnits,
    };

    this.setFilterSelection.emit(this._getVisualizationSelections());
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
}
