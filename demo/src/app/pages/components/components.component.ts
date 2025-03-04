import { Component, inject, OnInit } from '@angular/core';
import { OrganisationUnitSelectionConfig } from '@iapps/ng-dhis2-ui';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Period } from '@iapps/period-utilities';
import { TableRow } from 'packages/ng-dhis2-ui/src/lib/modules/line-list/models/line-list.models';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-components',
    templateUrl: './components.component.html',
    standalone: false
})
export class ComponentsComponent implements OnInit {
  httpClient = inject(NgxDhis2HttpClientService);
  selectedPeriods = [
    { id: 'THIS_MONTH', name: 'This month' },
    { id: 'LAST_MONTH', name: 'Last month' },
    { id: 'LAST_3_MONTHS', name: 'Last 3 months' },
  ];
  programId: string = 'piWUQa85ell';
  orgUnit: string = 'm0frOspS7JY';

  private inputChangeSubscription!: Subscription;

  private testValues = [
    { programId: 'HQiLn770L9r', orgUnit: 'm0frOspS7JY' },
    { programId: 'piWUQa85ell', orgUnit: 'm0frOspS7JY' },
    { programId: 'HQiLn770L9r', orgUnit: 'm0frOspS7JY' }
  ];
  private index = 0;

  ngOnInit() {
    this.httpClient
      .get('http://dashboards.json', { isExternalLink: true })
      .subscribe((res) => {
        console.log(res);
      });

    const periodInstance = new Period().setType('Weekly').get();
    this.inputChangeSubscription = interval(10000).subscribe(() => {
      this.index = (this.index + 1) % this.testValues.length;
      this.programId = this.testValues[this.index].programId;
      this.orgUnit = this.testValues[this.index].orgUnit;
      console.log(`Updated inputs: programId=${this.programId}, orgUnit=${this.orgUnit}`);
    });
    console.log('PERIOD LIST', periodInstance.list());
  }

  
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
  //event program = A3olldDSHQg
  //program stage= AFdwWJ6LpRT
 

  onActionSelected(event: { action: string; row: TableRow }) {
    console.log('Action selected:', event);
    if (event.action === 'Delete') {
      this.deleteRow(event.row);
    } else if (event.action === 'Edit') {
      this.editRow(event.row);
    }
  }
  
  deleteRow(row: TableRow) {
    console.log('Deleting row:', row);
    // Add API call or logic to delete row
  }
  
  editRow(row: TableRow) {
    console.log('Editing row:', row);
    // Add logic to edit row
  }

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

 
}
