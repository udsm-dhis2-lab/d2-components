import {
    DataTableCell,
    DataTableRow,
  } from '@dhis2/ui';
import React from 'react';
import { DataTableActions } from '../data-table-actions';
import { TableCell } from './tableCell';

export const TableRow = ({
  row,
  columns,
  getTextColorFromBackGround,
  actionOptions,
  actionOptionOrientation,
  actionSelected,
}: any) => (
  <DataTableRow key={row.index.value}>
    {columns.map((col: any) => {
      if (col.key === 'actions') {
        return (
          <DataTableCell key={col.key}>
            {actionOptions && (
              <DataTableActions
                actionOptions={actionOptions}
                actionOptionOrientation={actionOptionOrientation}
                onClick={(option) => {
                  if (option.onClick) option.onClick(row);
                  actionSelected.emit({ action: option.label, row });
                }}
              />
            )}
          </DataTableCell>
        );
      }

      return (
        <TableCell
          key={col.key}
          cell={row[col.key]}
          getTextColorFromBackGround={getTextColorFromBackGround}
        />
      );
    })}
  </DataTableRow>
);
