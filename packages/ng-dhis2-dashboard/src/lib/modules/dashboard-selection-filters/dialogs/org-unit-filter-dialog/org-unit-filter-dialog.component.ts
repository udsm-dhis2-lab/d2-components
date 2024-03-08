import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrgUnitFilterConfig } from '@iapps/ngx-dhis2-org-unit-filter';

@Component({
  selector: 'iapps-org-unit-filter-dialog',
  templateUrl: './org-unit-filter-dialog.component.html',
  styleUrls: ['./org-unit-filter-dialog.component.scss'],
})
export class OrgUnitFilterDialogComponent implements OnInit {
  orgUnitFilterConfig: OrgUnitFilterConfig = {
    singleSelection: false,
    showOrgUnitLevelGroupSection: true,
    showUserOrgUnitSection: true,
    reportUse: true,
    emitOnSelection: false,
  };
  firstAction?: string;
  constructor(
    private dialogRef: MatDialogRef<OrgUnitFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onOrgUnitUpdate(selectionItems: any, action: string) {
    if (!this.firstAction) {
      this.firstAction = action;
    }
    this.dialogRef.close({
      selectionItems,
      action: this.firstAction,
    });
  }
}
