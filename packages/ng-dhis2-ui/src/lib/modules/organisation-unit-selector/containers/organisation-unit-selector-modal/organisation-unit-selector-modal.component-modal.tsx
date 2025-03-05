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
import { NgxDhis2HttpClientService, User } from '@iapps/ngx-dhis2-http-client';
import React, { useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { firstValueFrom, map } from 'rxjs';
import { ReactWrapperComponent } from '../../../react-wrapper';
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
export class OrganisationUnitSelectorModalComponent extends ReactWrapperComponent {
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

  constructor(
    elementRef: ElementRef<HTMLElement>,
    private httpClient: NgxDhis2HttpClientService
  ) {
    super(elementRef);
  }

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    const rootOrgUnits = await this.getRootOrgUnits();

    const config = await this.getAppConfig();

    this.component = () => {
      const [selected, setSelected] = useState(this.selectedOrgUnits);
      return (
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
                  hideUserOrgUnits={
                    this.orgUnitSelectionConfig.hideUserOrgUnits
                  }
                  onSelect={(
                    selectionEvent: OrganisationUnitSelectionEvent
                  ) => {
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
                      this.onCancel();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    primary
                    disabled={selected.length === 0}
                    onClick={() => {
                      this.onConfirm(selected);
                    }}
                  >
                    Confirm
                  </Button>
                </ButtonStrip>
              </ModalActions>
            </Modal>
          }
        </Provider>
      );
    };

    this.render();
  }

  onCancel() {
    this.cancel.emit();
  }

  onConfirm(selectedItems: any[]) {
    this.confirm.emit(selectedItems);
  }

  private async getAppConfig() {
    const systemInfo = (await firstValueFrom(
      this.httpClient.systemInfo()
    )) as unknown as Record<string, unknown>;

    return {
      baseUrl: (document?.location?.host?.includes('localhost')
        ? `${document.location.protocol}//${document.location.host}`
        : systemInfo['contextPath']) as string,
      apiVersion: Number(
        (((systemInfo['version'] as string) || '')?.split('.') || [])[1]
      ),
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

  getRootOrgUnits(): Promise<string[]> {
    const orgUnitAttribute = this.getOrgUnitAttributeByUsage(
      this.orgUnitSelectionConfig.usageType
    );
    return firstValueFrom(
      this.httpClient
        .me()
        .pipe(
          map((user: User) =>
            (user ? user[orgUnitAttribute] : []).map((orgUnit) => orgUnit.id)
          )
        )
    );
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

  onSelectItems(selectionEvent: OrganisationUnitSelectionEvent) {
    this.selectOrgUnits.emit(selectionEvent.items);
  }
}
