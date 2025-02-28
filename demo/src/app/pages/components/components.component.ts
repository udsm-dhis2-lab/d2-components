import { Component, inject } from '@angular/core';
import { OrganisationUnitSelectionConfig } from '@iapps/ng-dhis2-ui';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Period } from '@iapps/period-utilities';

@Component({
    selector: 'app-components',
    templateUrl: './components.component.html',
    standalone: false
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

  tableColumns = [
    { label: "Name", key: "name" },
    { label: "Age", key: "age" },
    { label: "Country", key: "country" },
  ];
  
  tableData = [
    { name: "John Doe", age: 28, country: "Tanzania" },
    { name: "Jane Smith", age: 34, country: "Kenya" },
  ];
  
  onView(row: any) {
    console.log('View', row);
  }

  onEdit(row: any) {
    console.log('Edit', row);
  }

  onDelete(row: any) {
    console.log('Delete', row);
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

    const periodInstance = new Period().setType('Weekly').get();

    console.log('PERIOD LIST', periodInstance.list());
  }
}
