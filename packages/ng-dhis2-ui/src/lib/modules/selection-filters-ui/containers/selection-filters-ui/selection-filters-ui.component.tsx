import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  NgZone,
  Output,
  signal,
} from '@angular/core';
import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../../react-wrapper/react-wrapper.component';

import {
  ProgramAttributesFilter,
  ProgramStageDataElementFilter,
  SelectionFiltersProps,
} from '../../models/selection-filters-ui.model';
import { TableRow } from '../../models/selection-filters-ui.models';

import {
  InputField,
  SingleSelectField,
  SingleSelectOption,
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  CircularLoader,
} from '@dhis2/ui';
import { Provider } from '@dhis2/app-runtime';
import { firstValueFrom, map, Observable, zip } from 'rxjs';
import { NgxDhis2HttpClientService, User } from '@iapps/ngx-dhis2-http-client';
import { toObservable } from '@angular/core/rxjs-interop';
import { OrganisationUnitSelectionConfig } from '../../../organisation-unit-selector';
import OrgUnitDimension from '../../../organisation-unit-selector/components/OrgUnitDimension';

@Component({
  selector: 'app-selection-filters-ui',
  template: '<ng-content></ng-content>',
  styleUrls: ['./selection-filters-ui.component.scss'],
  standalone: false,
})
export class SelectionFiltersComponent
  extends ReactWrapperModule
  implements AfterViewInit
{
  @Input() actionOptions: {
    label: string;
    onClick: (row: TableRow) => void;
  }[] = [];
  @Input() programAttributesFilters: ProgramAttributesFilter[] = [];
  @Input() programStageDataElementFilters: ProgramStageDataElementFilter[] = [];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Output() actionSelected = new EventEmitter<SelectionFiltersProps>();

  httpClient = inject(NgxDhis2HttpClientService);
  ngZone = inject(NgZone);

  private getAppConfig(): Observable<any> {
    return this.httpClient.systemInfo().pipe(
      map((response) => {
        const systemInfo = response as unknown as Record<string, unknown>;
        return {
          baseUrl: (document?.location?.host?.includes('localhost')
            ? `${document.location.protocol}//${document.location.host}`
            : systemInfo['contextPath']) as string,
          apiVersion: Number(
            (((systemInfo['version'] as string) || '')?.split('.') || [])[1]
          ),
        };
      })
    );
  }

  getRootOrgUnits(): Observable<string[]> {
    const orgUnitAttribute = this.getOrgUnitAttributeByUsage(
      this.orgUnitSelectionConfig.usageType
    );
    return this.httpClient
      .me()
      .pipe(
        map((user: User) =>
          (user ? user[orgUnitAttribute] : []).map((orgUnit) => orgUnit.id)
        )
      );
  }

  getOrgUnitLevels(): Promise<any> {
    return firstValueFrom(
      this.httpClient
        .get(
          'organisationUnitLevels.json?fields=id,level,displayName,name&paging=false'
        )
        .pipe(
          map((res: Record<string, unknown>) => res?.['organisationUnitLevels'])
        )
    );
  }

  onSelectOrgUnit(selectedOrgUnits: Record<string, string>[]) {
    this.showOrgUnitTree.set(false);

    if ((selectedOrgUnits || [])[0]) {
      this.selectedOrgUnit.set(selectedOrgUnits[0]);
    }
  }

  getOrgUnitGroups(): Promise<any> {
    return firstValueFrom(
      this.httpClient
        .get(
          'organisationUnitGroups.json?fields=id,displayName,name&paging=false'
        )
        .pipe(
          map((res: Record<string, unknown>) => res?.['organisationUnitGroups'])
        )
    );
  }

  getOrgUnitAttributeByUsage(usageType: string) {
    switch (usageType) {
      case 'DATA_ENTRY':
        return 'organisationUnits';

      case 'DATA_VIEW':
        return 'dataViewOrganisationUnits';

      default:
        return 'organisationUnits';
    }
  }

  FieldOrgUnitSelector = (props: {
    onSelectOrgUnit: (selectedOrgUnits: any) => void;
    onCancelOrgUnit: () => void;
  }) => {
    const { onSelectOrgUnit, onCancelOrgUnit } = props;
    const [selected, setSelected] = useState([]);
    const [rootOrgUnits, setRootOrgUnits] = useState<string[]>();
    const [config, setConfig] = useState<any>();

    useEffect(() => {
      zip(this.getAppConfig(), this.getRootOrgUnits()).subscribe({
        next: ([appConfig, rootOrgUnits]) => {
          setConfig(appConfig);
          setRootOrgUnits(rootOrgUnits);
        },
        error: (error) => console.error(error),
      });
    }, []);
    return config ? (
      <Provider
        config={config}
        plugin={false}
        parentAlertsAdd={undefined}
        showAlertsInPlugin={false}
      >
        {
          <Modal position="middle" large>
            <ModalTitle>Organisation unit</ModalTitle>
            <ModalContent>
              <OrgUnitDimension
                selected={selected}
                hideGroupSelect={this.orgUnitSelectionConfig.hideGroupSelect}
                hideLevelSelect={this.orgUnitSelectionConfig.hideLevelSelect}
                hideUserOrgUnits={this.orgUnitSelectionConfig.hideUserOrgUnits}
                onSelect={(selectionEvent: any) => {
                  setSelected(selectionEvent.items);
                }}
                orgUnitGroupPromise={this.getOrgUnitGroups()}
                orgUnitLevelPromise={this.getOrgUnitLevels()}
                roots={rootOrgUnits}
              />
            </ModalContent>
            <ModalActions>
              <ButtonStrip end>
                <Button
                  onClick={() => {
                    onCancelOrgUnit();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  primary
                  disabled={selected.length === 0}
                  onClick={() => {
                    onSelectOrgUnit(selected);
                  }}
                >
                  Confirm
                </Button>
              </ButtonStrip>
            </ModalActions>
          </Modal>
        }
      </Provider>
    ) : (
      <CircularLoader small />
    );
  };
  showOrgUnitTree = signal<boolean>(false);
  orgUnitSelectionConfig: OrganisationUnitSelectionConfig = {
    hideGroupSelect: true,
    hideLevelSelect: true,
    hideUserOrgUnits: true,
    allowSingleSelection: true,
    usageType: 'DATA_ENTRY',
  };

  selectedOrgUnit = signal<any>(null);
  selectedOrgUnit$ = toObservable(this.selectedOrgUnit);

  SelectionFiltersUI = () => {
    const [filters, setFilters] = useState<{
      programAttributesFilters: ProgramAttributesFilter[];
      programStageDataElementFilters: ProgramStageDataElementFilter[];
      organizationUnitId: string;
      startDate: string;
      endDate: string;
    }>({
      programAttributesFilters: this.programAttributesFilters || [],
      programStageDataElementFilters: this.programStageDataElementFilters || [],
      organizationUnitId: '',
      startDate: this.startDate || '',
      endDate: this.endDate || '',
    });

    const [displayValue, setDisplayValue] = useState(null);
    const [selected, setSelected] = useState();
    const [selectedOrganisationUnit, setSelectedOrganisationUnit] = useState();
    const [touched, setTouched] = useState(false);
    const [showOrgUnit, setShowOrgUnit] = useState<boolean>(false);
    const [value, setValue] = useState(null);

    useEffect(() => {
      setFilters({
        programAttributesFilters: this.programAttributesFilters,
        programStageDataElementFilters: this.programStageDataElementFilters,
        organizationUnitId: '',
        startDate: this.startDate || '',
        endDate: this.endDate || '',
      });
    }, [
      this.programAttributesFilters,
      this.programStageDataElementFilters,
      this.startDate,
      this.endDate,
    ]);

    const handleAttributeChange = (index: number, selectedValue: string) => {
      setFilters((prevFilters) => {
        const updatedFilters = [...prevFilters.programAttributesFilters];
        updatedFilters[index] = {
          ...updatedFilters[index],
          value: selectedValue,
        };
        return { ...prevFilters, programAttributesFilters: updatedFilters };
      });
    };

    const handleDataElementChange = (index: number, selectedValue: string) => {
      setFilters((prevFilters) => {
        const updatedFilters = [...prevFilters.programStageDataElementFilters];
        updatedFilters[index] = {
          ...updatedFilters[index],
          value: selectedValue,
        };
        return {
          ...prevFilters,
          programStageDataElementFilters: updatedFilters,
        };
      });
    };

    const handleSearch = () => {
      this.actionSelected.emit({
        ...filters,
        organizationUnit: selectedOrganisationUnit,
        organizationUnitId: selectedOrganisationUnit,
        startDate: filters.startDate,
        endDate: filters.endDate,
      } as unknown as SelectionFiltersProps);
    };

    const getAttributeColumnSpan = (index: number) => {
      const totalItems = filters.programAttributesFilters.length;

      if (totalItems <= 4) {
        if (totalItems === 1) {
          return 'span 4';
        }
        if (totalItems === 2) {
          return 'span 2';
        }
        if (totalItems === 3) {
          return 'span 1';
        }
        if (totalItems === 4) {
          return 'span 1';
        }
      } else {
        const rowIndex = Math.floor(index / 2);
        if (index % 2 === 0) {
          return 'span 2';
        } else if (index === totalItems - 1) {
          return 'span 4';
        } else {
          return 'span 2';
        }
      }

      return 'span 1';
    };

    const getDataElementColumnSpan = (index: number) => {
      const totalItems = filters.programStageDataElementFilters.length;

      if (totalItems <= 4) {
        if (totalItems === 1) {
          return 'span 4';
        }
        if (totalItems === 2) {
          return 'span 2';
        }
        if (totalItems === 3) {
          return 'span 1';
        }
        if (totalItems === 4) {
          return 'span 1';
        }
      } else {
        const rowIndex = Math.floor(index / 2);
        if (index % 2 === 0) {
          return 'span 2';
        } else if (index === totalItems - 1) {
          return 'span 4';
        } else {
          return 'span 2';
        }
      }

      return 'span 1';
    };

    return (
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Organization Unit, Start Date, End Date Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <>
            <InputField
              value={displayValue}
              label="Organization Unit"
              readOnly={false}
              onFocus={() => {
                setShowOrgUnit(true);
              }}
              onBlur={() => {
                this.ngZone.run(() => {
                  console.log('THIS IS IT::: ');
                });
                setTouched(true);
              }}
            />
            {showOrgUnit && (
              <this.FieldOrgUnitSelector
                onCancelOrgUnit={() => {
                  setShowOrgUnit(false);
                  setTouched(true);
                }}
                onSelectOrgUnit={(selectedOrgUnits) => {
                  if ((selectedOrgUnits || [])[0]) {
                    const selectedOrgUnit = selectedOrgUnits[0];
                    setDisplayValue(selectedOrgUnit.name);
                    setSelected(selectedOrgUnit.id);
                    setSelectedOrganisationUnit(selectedOrgUnit.id);
                    setValue(selectedOrgUnit.id);
                    setShowOrgUnit(false);
                    setTouched(true);

                    // this.ngZone.run(() => {
                    //   setDisplayValue(selectedOrgUnit.name);
                    //   setSelected(selectedOrgUnit.id)
                    //   setSelectedOrganisationUnit(selectedOrgUnit.id)
                    //   setValue(selectedOrgUnit.id);
                    //   setShowOrgUnit(false);
                    // setTouched(true);
                    // });
                  }
                }}
              />
            )}
          </>

          <InputField
            className="input-field"
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(event: { value: string }) =>
              setFilters({ ...filters, startDate: event.value })
            }
          />

          <InputField
            className="input-field"
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(event: { value: string }) =>
              setFilters({ ...filters, endDate: event.value })
            }
          />
        </div>

        {/* Attribute Filters Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          {filters.programAttributesFilters.map((filter, index) => (
            <div
              key={index}
              style={{ gridColumn: getAttributeColumnSpan(index) }}
            >
              {filter.hasOptions && filter.options.length > 0 ? (
                <SingleSelectField
                  className="single-select"
                  label={filter.name || 'Select Option'}
                  selected={filter.value}
                  onChange={(event: { selected: string }) =>
                    handleAttributeChange(index, event.selected)
                  }
                >
                  {filter.options.map((option, i) => (
                    <SingleSelectOption
                      key={i}
                      label={option.name}
                      value={option.id}
                    />
                  ))}
                </SingleSelectField>
              ) : (
                <InputField
                  className="input-field"
                  label={filter.name || 'Program name'}
                  value={filter.value}
                  onChange={(event: { value: string }) =>
                    handleAttributeChange(index, event.value)
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Data Element Filters Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          {filters.programStageDataElementFilters.map((filter, index) => (
            <div
              key={index}
              style={{ gridColumn: getDataElementColumnSpan(index) }}
            >
              {filter.hasOptions && filter.options.length > 0 ? (
                <SingleSelectField
                  className="single-select"
                  label={filter.name || 'Aggregation type'}
                  selected={filter.value}
                  onChange={(event: { selected: string }) =>
                    handleDataElementChange(index, event.selected)
                  }
                >
                  {filter.options.map((option, i) => (
                    <SingleSelectOption
                      key={i}
                      label={option.name}
                      value={option.id}
                    />
                  ))}
                </SingleSelectField>
              ) : (
                <InputField
                  className="input-field"
                  label={filter.name || 'Program name'}
                  value={filter.value}
                  onChange={(event: { value: string }) =>
                    handleDataElementChange(index, event.value)
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Search Button */}
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.component = this.SelectionFiltersUI;
    this.render();
  }
}
