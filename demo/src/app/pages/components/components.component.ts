import { Component, inject } from '@angular/core';
import { OrganisationUnitSelectionConfig } from '@iapps/ng-dhis2-ui';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Period } from '@iapps/period-utilities';

@Component({
  selector: 'ng-dhis2-ui-app-componenent',
  templateUrl: './components.component.html',
  standalone: false,
})
export class ComponentsComponent {
  httpClient = inject(NgxDhis2HttpClientService);
  selectedPeriods = [
    { id: 'THIS_MONTH', name: 'This month' },
    { id: 'LAST_MONTH', name: 'Last month' },
    { id: 'LAST_3_MONTHS', name: 'Last 3 months' },
  ];

  attributeFilters = [
    {
      attribute: 'tgGvHgQgtQ0',
      operator: 'eq',
      value: `ABC_12355`,
    },
  ];

  isButtonLoading: any;

  constructor() {
    setInterval(() => {
      this.isButtonLoading = false; // Toggle value every 5 seconds
    }, 10000);
  }

  onActionSelected(emitActionResponse: any) {
    console.log(
      'ON ACTION SELECTED::: ',
      JSON.stringify(emitActionResponse, null, 4)
    );
  }

  filters = [
    {
      programStage: 'AFdwWJ6LpRT',
      dataElement: 'WCuw3RqR2pX',
      operator: '=',
      value: 'New event',
    },
  ];

  onApprovalSelected(data: any) {
    console.log('these are all the tei', data);
  }

  // [attributeFilters]="[
  //   { attribute: 'nfpxRnc5Rsg', operator: 'eq', value: 'A99' },
  //   { attribute: 'vZ6Eb7SovWK', operator: 'gt', value: 3 },
  //   { attribute: 'aukU9PbQpZs', operator: 'eq', value: 'Closed' },
  //   { attribute: 'jI43wrfikTb', operator: 'eq', value: 'true' }
  // ]"

  selectedOrgUnits = [];
  orgUnitSelectionConfig: OrganisationUnitSelectionConfig = {
    hideGroupSelect: false,
    hideLevelSelect: false,
    hideUserOrgUnits: false,
    allowSingleSelection: true,
    usageType: 'DATA_ENTRY',
  };
  onSelectOrgUnits(orgUnits: any) {
    this.selectedOrgUnits = orgUnits;

    console.log(this.selectedOrgUnits);
  }

  onSelectPeriods(periods: any) {
    console.log(periods);
  }

  onFirstValueEmitted(teiId: string) {
    console.log('first tei emitted', teiId);
  }

  tableColumns = [
    { label: 'Name', key: 'name' },
    { label: 'Age', key: 'age' },
    { label: 'Country', key: 'country' },
  ];

  tableData = [
    { name: 'John Doe', age: 28, country: 'Tanzania' },
    { name: 'Jane Smith', age: 34, country: 'Kenya' },
  ];

  rasFilters = [
    {
      programStage: 'k4ZFqYqRNDF',
      dataElement: 'Z4LwppfGhjI',
      operator: '=',
      value: 'Approved',
    },
    // {
    //   programStage: 'k4ZFqYqRNDF',
    //   dataElement: 'EBUF7spbIY1',
    //   operator: '=',
    //   value: 'DED',
    // },
    {
      programStage: 'NtZXBym2KfD',
      dataElement: 'lj3cQAle9Fo',
      operator: '=',
      value: 'Qualified',
    },
  ];

  //event program = A3olldDSHQg
  //program stage= AFdwWJ6LpRT

  // [attributeFilters]="[
  //   { attribute: 'WCuw3RqR2pX', operator: 'eq', value: 'Ongoing event' },
  // ]"

  onView(row: any) {
    console.log('View', row);
  }

  onEdit(row: any) {
    console.log('Edit', row);
  }

  onDelete(row: any) {
    console.log('Delete', row);
  }

  onGenerateReport(row: any): void {
    console.log('Delete', row);
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
