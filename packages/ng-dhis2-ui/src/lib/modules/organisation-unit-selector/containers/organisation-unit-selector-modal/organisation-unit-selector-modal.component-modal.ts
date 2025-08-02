import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Provider } from '@dhis2/app-runtime';
import {
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
} from '@dhis2/ui';
import { D2Window } from '@iapps/d2-web-sdk';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../../react-wrapper/react-wrapper.component';
import OrgUnitDimension from '../../components/OrgUnitDimension';
import {
  OrganisationUnitSelectionConfig,
  OrganisationUnitSelectionUsageType,
} from '../../models';

type OrganisationUnitSelectionEvent = {
  dimensionId: string;
  items: Record<string, unknown>[];
};

@Component({
  selector: 'ng-dhis2-ui-org-unit-selector-modal',
  template: '<ng-container><ng-container>',
  styles: [
    `
      ::ng-deep .layer {
        z-index: 2 !important;
      }
    `,
  ],
  standalone: false,
})
export class OrganisationUnitSelectorModalComponent extends ReactWrapperModule {
  d2 = (window as unknown as D2Window).d2Web;
  @Input() selectedOrgUnits: any[] = [];
  @Input() orgUnitSelectionConfig: OrganisationUnitSelectionConfig =
    new OrganisationUnitSelectionConfig();

  @Output() selectOrgUnits = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() confirm = new EventEmitter();

  override props: Record<string, unknown> = {
    onSelect: (e: any) => {
      this.onSelectItems(e);
    },
  };

  constructor(elementRef: ElementRef<HTMLElement>) {
    super(elementRef);
  }

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    const rootOrgUnits = await this.getRootOrgUnits();

    const config = await this.getAppConfig();

    if (config) {
      this.component = () => {
        const [selected, setSelected] = useState(this.selectedOrgUnits);
        return React.createElement(Provider, {
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
                onSelect: (selectionEvent: OrganisationUnitSelectionEvent) => {
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
                      this.onCancel();
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
                      this.onConfirm(selected);
                    },
                  },
                  'Confirm'
                )
              )
            )
          ),
        });
      };

      this.render();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onConfirm(selectedItems: any[]) {
    this.confirm.emit(selectedItems);
  }

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

  getOrgUnitAttributeByUsage(usageType: OrganisationUnitSelectionUsageType) {
    switch (usageType) {
      case 'DATA_ENTRY':
        return 'organisationUnits';

      case 'DATA_VIEW':
        return 'dataViewOrganisationUnits';

      default:
        return 'organisationUnits';
    }
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

  onSelectItems(selectionEvent: OrganisationUnitSelectionEvent) {
    this.selectOrgUnits.emit(selectionEvent.items);
  }
}
