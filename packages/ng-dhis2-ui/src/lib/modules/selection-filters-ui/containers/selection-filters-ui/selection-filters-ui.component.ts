/* eslint-disable @angular-eslint/component-selector */
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
import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../../react-wrapper/react-wrapper.component';

import {
  ProgramAttributesFilter,
  ProgramStageDataElementFilter,
  SelectionFiltersProps,
  SelectionFilterTableRow,
} from '../../models/selection-filters-ui.model';

import { toObservable } from '@angular/core/rxjs-interop';
import { Provider } from '@dhis2/app-runtime';
import {
  Button,
  ButtonStrip,
  CircularLoader,
  InputField,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
} from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import { take, zip } from 'rxjs';
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
  d2 = (window as unknown as D2Window).d2Web;

  @Input() actionOptions: {
    label: string;
    onClick: (row: SelectionFilterTableRow) => void;
  }[] = [];
  @Input() programAttributesFilters: ProgramAttributesFilter[] = [];
  @Input() programStageDataElementFilters: ProgramStageDataElementFilter[] = [];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() program?: string;
  @Input() organisationUnit?: string;
  @Input() selectedOrgUnit?: any;
  @Input() orgUnitFieldTitle?: string;

  @Output() actionSelected = new EventEmitter<SelectionFiltersProps>();

  ngZone = inject(NgZone);

  private async getAppConfig() {
    const systemInfo = this.d2.systemInfo;
    if (!systemInfo) {
      return systemInfo;
    }
    return {
      baseUrl: document?.location?.host?.includes('localhost')
        ? `${document.location.protocol}//${document.location.host}`
        : systemInfo.contextPath,
      apiVersion: systemInfo.apiVersion,
    };
  }

  async getRootOrgUnits(): Promise<string[]> {
    const orgUnitAttribute = this.getOrgUnitAttributeByUsage(
      this.orgUnitSelectionConfig.usageType
    );
    const currentUser = this.d2?.currentUser;
    return (currentUser ? currentUser[orgUnitAttribute] : []).map(
      (orgUnit) => orgUnit.id
    );
  }

  async getOrgUnitGroups(): Promise<any> {
    const orgUnitGroupResponse = await this.d2?.httpInstance?.get(
      'organisationUnitGroups.json?fields=id,displayName,name&paging=false',
      {
        useIndexDb: this.orgUnitSelectionConfig?.allowCaching,
      }
    );
    return orgUnitGroupResponse?.data?.['organisationUnitGroups'] ?? [];
  }

  async getOrgUnitLevels(): Promise<any> {
    const orgUnitLevelResponse = await this.d2?.httpInstance?.get(
      'organisationUnitLevels.json?fields=id,level,displayName,name&paging=false',
      {
        useIndexDb: this.orgUnitSelectionConfig?.allowCaching,
      }
    );
    return orgUnitLevelResponse?.data?.['organisationUnitLevels'] ?? [];
  }

  onSelectOrgUnit(selectedOrgUnits: Record<string, string>[]) {
    this.showOrgUnitTree.set(false);
    if ((selectedOrgUnits || [])[0]) {
      this.selectedOrgUnitSignal.set(selectedOrgUnits[0]);
    }
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
      const subscription = zip(this.getAppConfig(), this.getRootOrgUnits())
        .pipe(take(1))
        .subscribe({
          next: ([appConfig, rootOrgUnits]) => {
            setConfig(appConfig);
            setRootOrgUnits(rootOrgUnits);
          },
          error: (error) => console.error(error),
        });
      return () => subscription.unsubscribe();
    }, []);

    return config
      ? React.createElement(Provider, {
          config: config,
          plugin: false,
          parentAlertsAdd: undefined,
          showAlertsInPlugin: false,
          children: React.createElement(
            Modal,
            { position: 'middle', large: true },
            React.createElement(ModalTitle, null, this.orgUnitFieldTitle ? this.orgUnitFieldTitle : 'Organisation Unit'),
            React.createElement(
              ModalContent,
              null,
              React.createElement(OrgUnitDimension, {
                selected: selected,
                hideGroupSelect: this.orgUnitSelectionConfig.hideGroupSelect,
                hideLevelSelect: this.orgUnitSelectionConfig.hideLevelSelect,
                hideUserOrgUnits: this.orgUnitSelectionConfig.hideUserOrgUnits,
                onSelect: (selectionEvent: any) => {
                  setSelected(selectionEvent.items);
                },
                orgUnitGroupPromise: this.getOrgUnitGroups(),
                orgUnitLevelPromise: this.getOrgUnitLevels(),
                roots: rootOrgUnits,
              })
            ),
            React.createElement(
              ModalActions,
              null,
              React.createElement(
                ButtonStrip,
                { end: true },
                React.createElement(
                  Button,
                  { onClick: onCancelOrgUnit },
                  'Cancel'
                ),
                React.createElement(
                  Button,
                  {
                    primary: true,
                    disabled: selected.length === 0,
                    onClick: () => onSelectOrgUnit(selected),
                  },
                  'Confirm'
                )
              )
            )
          ),
        } as any)
      : React.createElement(CircularLoader, { small: true });
  };

  showOrgUnitTree = signal<boolean>(false);
  orgUnitSelectionConfig: OrganisationUnitSelectionConfig = {
    hideGroupSelect: true,
    hideLevelSelect: true,
    hideUserOrgUnits: true,
    allowSingleSelection: true,
    usageType: 'DATA_ENTRY',
  };

  // Renamed to avoid shadowing the @Input
  selectedOrgUnitSignal = signal<any>(null);
  selectedOrgUnit$ = toObservable(this.selectedOrgUnitSignal);

  SelectionFiltersUI = () => {
    const [filters, setFilters] = useState<{
      programAttributesFilters: ProgramAttributesFilter[];
      programStageDataElementFilters: ProgramStageDataElementFilter[];
      startDate: string;
      endDate: string;
      program: string;
      organisationUnit: string;
    }>({
      programAttributesFilters: this.programAttributesFilters || [],
      programStageDataElementFilters: this.programStageDataElementFilters || [],
      startDate: this.startDate || '',
      endDate: this.endDate || '',
      program: this.program || '',
      organisationUnit: this.organisationUnit || '',
    });

    const [displayValue, setDisplayValue] = useState<string | null>(null);
    const [selected, setSelected] = useState<any>();
    const [selectedOrganisationUnit, setSelectedOrganisationUnit] = useState<
      string | undefined
    >();
    const [touched, setTouched] = useState(false);
    const [showOrgUnit, setShowOrgUnit] = useState<boolean>(false);
    const [value, setValue] = useState<any>(null);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const toggleMoreFilters = () => setShowMoreFilters((prev) => !prev);

    useEffect(() => {
      const su = (this as any).selectedOrgUnit;
      if (su) {
        if (typeof su === 'object') {
          const id = su.id ?? su.uid ?? su.code ?? su.value ?? undefined;
          if (su.name) {
            setDisplayValue(su.name);
          }
          if (id) {
            setSelectedOrganisationUnit(id);
            setFilters((prev) => ({ ...prev, organisationUnit: id }));
            setValue(id);
          }
        } else if (typeof su === 'string') {
          setSelectedOrganisationUnit(su);
          setFilters((prev) => ({ ...prev, organisationUnit: su }));
          setDisplayValue(su);
          setValue(su);
        }
      }
    }, [this.selectedOrgUnit]);

    useEffect(() => {
      setFilters({
        programAttributesFilters: this.programAttributesFilters,
        programStageDataElementFilters: this.programStageDataElementFilters,
        startDate: this.startDate || '',
        endDate: this.endDate || '',
        program: this.program || '',
        organisationUnit: this.organisationUnit || filters.organisationUnit,
      });
    }, [
      this.programAttributesFilters,
      this.programStageDataElementFilters,
      this.startDate,
      this.endDate,
      this.program,
      this.organisationUnit,
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
        organisationUnit:
          selectedOrganisationUnit ||
          this.organisationUnit ||
          filters.organisationUnit,
        startDate: filters.startDate,
        endDate: filters.endDate,
        program: this.program || filters.program,
      } as unknown as SelectionFiltersProps);
    };

    const getAttributeColumnSpan = (index: number) => {
      const totalItems = filters.programAttributesFilters.length;
      if (totalItems <= 4) {
        if (totalItems === 1) return 'span 4';
        if (totalItems === 2) return 'span 2';
        return 'span 1';
      } else {
        if (index % 2 === 0) return 'span 2';
        if (index === totalItems - 1) return 'span 4';
        return 'span 2';
      }
    };

    const getDataElementColumnSpan = (index: number) => {
      const totalItems = filters.programStageDataElementFilters.length;
      if (totalItems <= 4) {
        if (totalItems === 1) return 'span 4';
        if (totalItems === 2) return 'span 2';
        return 'span 1';
      } else {
        if (index % 2 === 0) return 'span 2';
        if (index === totalItems - 1) return 'span 4';
        return 'span 2';
      }
    };

    return React.createElement(
      'div',
      {
        style: {
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr auto',
            gap: '16px',
            // 👇 Bottom-align everything in the row so labels don't push inputs higher than the button
            alignItems: 'end',
            marginBottom: '16px',
          },
        },

        // Organization Unit
        React.createElement(
          'div',
          { style: { width: '100%' } },
          React.createElement(InputField, {
            value: displayValue,
            label: this.orgUnitFieldTitle ? this.orgUnitFieldTitle : 'Organisation Unit',
            readOnly: false,
            onFocus: () => setShowOrgUnit(true),
          }),
          showOrgUnit &&
            React.createElement(this.FieldOrgUnitSelector, {
              onCancelOrgUnit: () => setShowOrgUnit(false),
              onSelectOrgUnit: (selectedOrgUnits) => {
                if ((selectedOrgUnits || [])[0]) {
                  const selectedOrgUnit = selectedOrgUnits[0];
                  setDisplayValue(selectedOrgUnit.name);
                  setSelectedOrganisationUnit(selectedOrgUnit.id);
                  setShowOrgUnit(false);
                }
              },
            })
        ),

        // Start Date
        React.createElement(InputField, {
          className: 'input-field',
          label: 'Start Date',
          type: 'date',
          value: filters.startDate,
          onChange: (event: { value: string }) =>
            setFilters({ ...filters, startDate: event.value }),
        }),

        // End Date
        React.createElement(InputField, {
          className: 'input-field',
          label: 'End Date',
          type: 'date',
          value: filters.endDate,
          onChange: (event: { value: string }) =>
            setFilters({ ...filters, endDate: event.value }),
        }),

        // Action Button (same line, bottom-aligned)
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'flex-end',
              // 👇 Ensure this cell itself bottoms out in the grid row
              alignSelf: 'end',
            },
          },
          React.createElement(
            Button,
            { style: { height: '40px' }, onClick: handleSearch },
            'Generate Report'
          )
        )
      )
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.component = this.SelectionFiltersUI;
    this.render();
  }
}
