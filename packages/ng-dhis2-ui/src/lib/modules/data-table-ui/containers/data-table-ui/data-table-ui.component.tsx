import {
  Component,
  Input,
  AfterViewInit,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  CircularLoader,
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  TableFoot,
} from '@dhis2/ui';
import React, { useState, useEffect } from 'react';

import { ReactWrapperModule } from '../../../react-wrapper/react-wrapper.component';
import * as ReactDOM from 'react-dom/client';
import { ColumnDefinition, TableRow } from '../../models/data-table.models';
import {
  DropdownMenu,
  DropdownMenuOption,
} from '../../components/dropdown-menu';

@Component({
  selector: 'app-data-table-ui',
  standalone: false,
  template: '<ng-content></ng-content>',
  styleUrls: ['./data-table-ui.component.scss'],
})
export class DataTableUIComponent
  extends ReactWrapperModule
  implements AfterViewInit, OnChanges
{
  @Input() data!: TableRow[];
  @Input() columnDefinitions!: ColumnDefinition[];
  @Input() actionOptions?: DropdownMenuOption[];
  @Output() actionSelected = new EventEmitter<{
    action: string;
    row: TableRow;
  }>();

  DataTableUI = () => {
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const hasData = this.data?.length > 0;
      const hasColumns = this.columnDefinitions?.length > 0;

      if (!hasData || !hasColumns) {
        setLoading(true);
        return;
      }

      const filteredColumns = this.columnDefinitions.filter(
        (col) => col.visible !== false
      );
      const sortedColumns = filteredColumns.sort((a, b) => {
        const indexA = Number(a.index) || 0;
        const indexB = Number(b.index) || 0;
        return indexA - indexB;
      });

      setColumns(sortedColumns);
      setTableData(this.data);
      setLoading(false);
    }, [this.data, this.columnDefinitions]);

    const getDropdownOptions = (row: TableRow): DropdownMenuOption[] => {
      return (this.actionOptions || []).map((option) => ({
        ...option,
        onClick: () => {
          if (option.onClick) {
            option.onClick(row);
          }
          this.actionSelected.emit({ action: option.label, row });
        },
      }));
    };

    return (
      <div>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
            }}
          >
            <CircularLoader small />
            <div
              style={{
                fontSize: 14,
              }}
            >
              Loading
            </div>
          </div>
        ) : (
          <DataTable>
            <TableHead>
              <DataTableRow>
                {columns.map((col) => (
                  <DataTableColumnHeader key={col.column}>
                    {col.display}
                  </DataTableColumnHeader>
                ))}
                {this.actionOptions && this.actionOptions.length > 0 && (
                  <DataTableColumnHeader>Actions</DataTableColumnHeader>
                )}
              </DataTableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <DataTableRow key={rowIndex}>
                  {columns.map((col) => (
                    <DataTableCell key={col.column}>
                      {row[col.column] || '-'}
                    </DataTableCell>
                  ))}
                  {this.actionOptions && this.actionOptions.length > 0 && (
                    <DataTableCell>
                      <DropdownMenu
                        dropdownOptions={getDropdownOptions(row)}
                        onClick={(option) => option.onClick?.(row)}
                      />
                    </DataTableCell>
                  )}
                </DataTableRow>
              ))}
            </TableBody>
            <TableFoot>
              <DataTableRow>
                <DataTableCell
                  colSpan={(columns.length || 0 + 1).toString()}
                ></DataTableCell>
              </DataTableRow>
            </TableFoot>
          </DataTable>
        )}
      </div>
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.component = this.DataTableUI;
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columnDefinitions']) {
      if (!this.elementRef) throw new Error('No element ref');
      this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
      this.component = this.DataTableUI;
      this.render();
    }
  }
}
