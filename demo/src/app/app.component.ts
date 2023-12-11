import { Component } from '@angular/core';

@Component({
  selector: 'ng-dhis2-ui-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'demo';
  selectedPeriods = [
    { id: 'THIS_MONTH', name: 'This month' },
    { id: 'LAST_MONTH', name: 'Last month' },
    { id: 'LAST_3_MONTHS', name: 'Last 3 months' },
  ];

  selectedOrgUnits = [];

  onSelectPeriods(periods: any) {
    console.log(periods);
  }

  onSelectOrgUnits(orgUnits: any) {
    this.selectedOrgUnits = orgUnits;

    console.log(this.selectedOrgUnits);
  }
}
