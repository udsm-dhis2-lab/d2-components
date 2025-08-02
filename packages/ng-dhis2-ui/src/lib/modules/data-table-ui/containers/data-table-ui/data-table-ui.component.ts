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

    return React.createElement(
      'div',
      null,
      loading
        ? React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: 8,
              },
            },
            React.createElement(CircularLoader, { small: true }),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: 14,
                },
              },
              'Loading'
            )
          )
        : React.createElement(
            DataTable,
            null,
            React.createElement(
              TableHead,
              null,
              React.createElement(
                DataTableRow,
                null,
                ...columns.map((col) =>
                  React.createElement(
                    DataTableColumnHeader,
                    { key: col.column },
                    col.display
                  )
                ),
                this.actionOptions && this.actionOptions.length > 0
                  ? React.createElement(DataTableColumnHeader, null, 'Actions')
                  : null
              )
            ),
            React.createElement(
              TableBody,
              null,
              ...tableData.map((row, rowIndex) =>
                React.createElement(
                  DataTableRow,
                  { key: rowIndex },
                  ...columns.map((col) =>
                    React.createElement(
                      DataTableCell,
                      { key: col.column },
                      row[col.column] || '-'
                    )
                  ),
                  this.actionOptions && this.actionOptions.length > 0
                    ? React.createElement(
                        DataTableCell,
                        null,
                        React.createElement(DropdownMenu, {
                          dropdownOptions: getDropdownOptions(row),
                          onClick: (option) => option.onClick?.(row),
                        })
                      )
                    : null
                )
              )
            ),
            React.createElement(
              TableFoot,
              null,
              React.createElement(
                DataTableRow,
                null,
                React.createElement(DataTableCell, {
                  colSpan: (columns.length + 1).toString(),
                })
              )
            )
          )
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
