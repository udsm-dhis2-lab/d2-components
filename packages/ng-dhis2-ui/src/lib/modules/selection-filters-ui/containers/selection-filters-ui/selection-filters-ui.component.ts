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
  TableRow,
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
  SingleSelectField,
  SingleSelectOption,
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
    onClick: (row: TableRow) => void;
  }[] = [];
  @Input() programAttributesFilters: ProgramAttributesFilter[] = [];
  @Input() programStageDataElementFilters: ProgramStageDataElementFilter[] = [];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() program?: string;
  @Input() organisationUnit?: string;
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
      this.selectedOrgUnit.set(selectedOrgUnits[0]);
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

    // TODO: START::: Improve approach on handling observables
    // useEffect(() => {
    //   zip(this.getAppConfig(), this.getRootOrgUnits()).subscribe({
    //     next: ([appConfig, rootOrgUnits]) => {
    //       setConfig(appConfig);
    //       setRootOrgUnits(rootOrgUnits);
    //     },
    //     error: (error) => console.error(error),
    //   });
    // }, []);
    // TODO: END::: Improve approach on handling observables

    useEffect(() => {
      const subscription = zip(this.getAppConfig(), this.getRootOrgUnits())
        .pipe(take(1)) // Ensures only one emission
        .subscribe({
          next: ([appConfig, rootOrgUnits]) => {
            setConfig(appConfig);
            setRootOrgUnits(rootOrgUnits);
          },
          error: (error) => console.error(error),
        });

      return () => {
        subscription.unsubscribe(); // Cleanup to avoid memory leaks
      };
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
            React.createElement(ModalTitle, null, 'Organisation unit'),
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
                  {
                    onClick: () => {
                      onCancelOrgUnit();
                    },
                  },
                  'Cancel'
                ),
                React.createElement(
                  Button,
                  {
                    primary: true,
                    disabled: selected.length === 0,
                    onClick: () => {
                      onSelectOrgUnit(selected);
                    },
                  },
                  'Confirm'
                )
              )
            )
          ),
        })
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

  selectedOrgUnit = signal<any>(null);
  selectedOrgUnit$ = toObservable(this.selectedOrgUnit);

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

    const [displayValue, setDisplayValue] = useState(null);
    const [selected, setSelected] = useState();
    const [selectedOrganisationUnit, setSelectedOrganisationUnit] = useState();
    const [touched, setTouched] = useState(false);
    const [showOrgUnit, setShowOrgUnit] = useState<boolean>(false);
    const [value, setValue] = useState(null);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const toggleMoreFilters = () => setShowMoreFilters((prev) => !prev);

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
            gridTemplateColumns: '1fr 1fr 1fr auto', // Ensure proper button sizing
            gap: '16px',
            alignItems: 'center', // Align inputs and button on the same row
            marginBottom: '16px',
          },
        },
        /* Organization Unit Selector */
        React.createElement(
          'div',
          { style: { width: '100%' } },
          React.createElement(InputField, {
            value: displayValue,
            label: 'Organization Unit',
            readOnly: false,
            onFocus: () => setShowOrgUnit(true),
            onBlur: () => {
              setTouched(true);
            },
          }),
          showOrgUnit &&
            React.createElement(this.FieldOrgUnitSelector, {
              onCancelOrgUnit: () => {
                setShowOrgUnit(false);
                setTouched(true);
              },
              onSelectOrgUnit: (selectedOrgUnits) => {
                if ((selectedOrgUnits || [])[0]) {
                  const selectedOrgUnit = selectedOrgUnits[0];
                  setDisplayValue(selectedOrgUnit.name);
                  setSelected(selectedOrgUnit.id);
                  setSelectedOrganisationUnit(selectedOrgUnit.id);
                  setValue(selectedOrgUnit.id);
                  setShowOrgUnit(false);
                  setTouched(true);
                }
              },
            })
        ),

        /* Start Date */
        React.createElement(InputField, {
          className: 'input-field',
          label: 'Start Date',
          type: 'date',
          value: filters.startDate,
          onChange: (event: { value: string }) =>
            setFilters({ ...filters, startDate: event.value }),
        }),

        /* End Date */
        React.createElement(InputField, {
          className: 'input-field',
          label: 'End Date',
          type: 'date',
          value: filters.endDate,
          onChange: (event: { value: string }) =>
            setFilters({ ...filters, endDate: event.value }),
        }),

        /* Toggle Button with Hidden Label */
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            },
          },
          React.createElement(
            'label',
            {
              style: {
                color: 'transparent', // Hides label text but keeps spacing
                fontSize: '14px',
                marginBottom: '4px',
              },
            },
            'Toggle'
          ),
          React.createElement(
            Button,
            {
              style: { height: '40px' }, // Match input field height
              onClick: () => setShowMoreFilters(!showMoreFilters),
            },
            showMoreFilters ? 'Hide Filters' : 'More Filters'
          )
        ),

        showMoreFilters &&
          React.createElement(
            React.Fragment,
            null,
            /* Attribute Filters Grid */
            React.createElement(
              'div',
              {
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                },
              },
              filters.programAttributesFilters.map((filter, index) =>
                React.createElement(
                  'div',
                  {
                    key: index,
                    style: { gridColumn: getAttributeColumnSpan(index) },
                  },
                  filter.hasOptions && filter.options.length > 0
                    ? React.createElement(
                        SingleSelectField,
                        {
                          className: 'single-select',
                          label: filter.name || 'Select Option',
                          selected: filter.value,
                          onChange: (event: { selected: string }) =>
                            handleAttributeChange(index, event.selected),
                        },
                        filter.options.map((option, i) =>
                          React.createElement(SingleSelectOption, {
                            key: crypto.randomUUID() || i,
                            label: option.name,
                            value: option.code,
                          })
                        )
                      )
                    : React.createElement(InputField, {
                        className: 'input-field',
                        label: filter.name || 'Program name',
                        type: filter.valueType as any,
                        value: filter.value,
                        onChange: (event: { value: string }) =>
                          handleAttributeChange(index, event.value),
                      })
                )
              )
            ),

            /* Data Element Filters Grid */
            React.createElement(
              'div',
              {
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px',
                },
              },
              filters.programStageDataElementFilters.map((filter, index) =>
                React.createElement(
                  'div',
                  {
                    key: index,
                    style: { gridColumn: getDataElementColumnSpan(index) },
                  },
                  filter.hasOptions && filter.options.length > 0
                    ? React.createElement(
                        SingleSelectField,
                        {
                          className: 'single-select',
                          label: filter.name || 'Aggregation type',
                          selected: filter.value,
                          onChange: (event: { selected: string }) =>
                            handleDataElementChange(index, event.selected),
                        },
                        filter.options.map((option, i) =>
                          React.createElement(SingleSelectOption, {
                            key: crypto.randomUUID() || i,
                            label: option.name,
                            value: option.code,
                          })
                        )
                      )
                    : React.createElement(InputField, {
                        className: 'input-field',
                        type: filter.valueType as any,
                        label: filter.name || 'Program name',
                        value: filter.value,
                        onChange: (event: { value: string }) =>
                          handleDataElementChange(index, event.value),
                      })
                )
              )
            ),

            /* Search Button */
            React.createElement(
              'div',
              { style: { textAlign: 'right', marginTop: '16px' } },
              React.createElement(Button, { onClick: handleSearch }, 'Search')
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
