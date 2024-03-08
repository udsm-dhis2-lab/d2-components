import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { ErrorMessage } from '@iapps/ngx-dhis2-http-client';
import { catchError, Observable, of, tap } from 'rxjs';
import { DashboardAdditionalFilter } from '../../../../../lib/models';
import { DashboardSelectionFilterService } from '../../services/dashboard-selection-filter.service';

@Component({
  selector: 'd2-additional-filter-dialog',
  templateUrl: './additional-filter-dialog.component.html',
  styleUrls: ['./additional-filter-dialog.component.css'],
})
export class AdditionalFilterDialogComponent implements OnInit {
  filterSelection$!: Observable<DashboardAdditionalFilter | null>;
  loading!: boolean;
  loadingError: any;
  constructor(
    private dialogRef: MatDialogRef<AdditionalFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DashboardAdditionalFilter,
    private filterService: DashboardSelectionFilterService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.filterSelection$ = this.filterService
      .getFilterSelection(this.data)
      .pipe(
        tap(() => {
          this.loading = false;
        }),
        catchError((error: ErrorMessage) => {
          this.loading = false;
          this.loadingError = error;
          return of(null);
        })
      );
  }

  onUpdate(event: MouseEvent, optionRefList: MatSelectionList, options: any[]) {
    event.stopPropagation();

    this.dialogRef.close({
      selectedOptions: optionRefList.selectedOptions.selected.map(
        (selectedOption) => {
          return options.find((option) => option.code === selectedOption.value);
        }
      ),
    });
  }
}
