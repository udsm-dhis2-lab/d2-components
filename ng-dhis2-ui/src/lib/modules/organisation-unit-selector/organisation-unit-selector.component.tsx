import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ReactWrapperComponent } from '../../shared';
import { NgxDhis2HttpClientService, User } from '@iapps/ngx-dhis2-http-client';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { firstValueFrom, map } from 'rxjs';
import { DataProvider } from '@dhis2/app-runtime';
import OrgUnitDimension from './components/OrgUnitDimension';
import {
  OrganisationUnitSelectionConfig,
  OrganisationUnitSelectionUsageType,
} from './models';

type OrganisationUnitSelectionEvent = {
  dimensionId: string;
  items: Record<string, unknown>[];
};

@Component({
  selector: 'ng-dhis2-ui-org-unit-selector',
  template: '<ng-container><ng-container>',
})
export class OrganisationUnitSelectorComponent extends ReactWrapperComponent {
  @Input() selectedOrgUnits: any[] = [];
  @Input() orgUnitSelectionConfig: OrganisationUnitSelectionConfig =
    new OrganisationUnitSelectionConfig();

  @Output() selectOrgUnits = new EventEmitter();

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

    this.component = () => (
      <DataProvider>
        {
          <OrgUnitDimension
            selected={this.selectedOrgUnits}
            hideGroupSelect={this.orgUnitSelectionConfig.hideGroupSelect}
            hideLevelSelect={this.orgUnitSelectionConfig.hideLevelSelect}
            hideUserOrgUnits={this.orgUnitSelectionConfig.hideUserOrgUnits}
            onSelect={(selectionEvent: OrganisationUnitSelectionEvent) =>
              this.onSelectItems(selectionEvent)
            }
            orgUnitGroupPromise={this.getOrgUnitGroups()}
            orgUnitLevelPromise={this.getOrgUnitLevels()}
            roots={rootOrgUnits}
          />
        }
      </DataProvider>
    );

    this.render();
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
