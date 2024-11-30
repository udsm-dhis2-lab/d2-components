import { Component, inject } from '@angular/core';
import { OrganisationUnitSelectionConfig } from '@iapps/ng-dhis2-ui';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
})
export class ComponentsComponent {
  httpClient = inject(NgxDhis2HttpClientService);
  selectedPeriods = [
    { id: 'THIS_MONTH', name: 'This month' },
    { id: 'LAST_MONTH', name: 'Last month' },
    { id: 'LAST_3_MONTHS', name: 'Last 3 months' },
  ];

  selectedOrgUnits = [];
  orgUnitSelectionConfig: OrganisationUnitSelectionConfig = {
    hideGroupSelect: false,
    hideLevelSelect: false,
    hideUserOrgUnits: false,
    allowSingleSelection: true,
    usageType: 'DATA_ENTRY',
  };
  onSelectPeriods(periods: any) {
    console.log(periods);
  }

  onSelectOrgUnits(orgUnits: any) {
    this.selectedOrgUnits = orgUnits;

    console.log(this.selectedOrgUnits);
  }

  ngOnInit() {
    this.httpClient
      .get('http://dashboards.json', { isExternalLink: true })
      .subscribe((res) => {
        console.log(res);
      });
  }
}
