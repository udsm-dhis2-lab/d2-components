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
  IconChevronDown16,
  IconChevronUp16,
  Button,
} from '@dhis2/ui';
import { keys } from 'lodash';
import React, { useState } from 'react';
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

  FilterButton = () => {
    const [showMenu, setShowMenu] = useState(false);
    return (
      <div
        style={{
          position: 'relative',
        }}
      >
        <Button
          icon={<IconFilter16 />}
          onClick={() => {
            setShowMenu(!showMenu);
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacers.dp8,
            }}
          >
            <span>Add filter</span>

            {showMenu ? (
              <IconChevronUp16 style={{ height: 4 }} />
            ) : (
              <IconChevronDown16 />
            )}
          </div>
        </Button>
        {showMenu && (
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 0,
              width: 180,
              right: 0,
              zIndex: 1,
            }}
          >
            <FlyoutMenu dense>
              <MenuItem
                icon={<IconClock16 />}
                label="Period"
                onClick={() => {
                  setShowMenu(false);
                  this.showPeriodSelector.set(true);
                }}
              />
              <MenuItem
                icon={<IconDimensionOrgUnit16 />}
                label="Organisation unit"
                onClick={() => {
                  setShowMenu(false);
                  this.showOrgUnitSelector.set(true);
                }}
              />
            </FlyoutMenu>
          </div>
        )}
      </div>
    );
  };

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
