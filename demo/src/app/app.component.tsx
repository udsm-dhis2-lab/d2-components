import { Component } from '@angular/core';
import { Menu, MenuItem } from '@dhis2/ui';
import React from 'react';

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
  menu = () => (
    <div>
      <Menu>
        <MenuItem label="Menu item" />
        <MenuItem label="Menu item" />
      </Menu>
    </div>
  );

  onSelectPeriods(periods: any) {
    console.log(periods);
  }

  onSelectOrgUnits(orgUnits: any) {
    this.selectedOrgUnits = orgUnits;

    console.log(this.selectedOrgUnits);
  }
}
