import { Checkbox, DataTableCell, DataTableRow } from '@dhis2/ui';
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
  isChecked,
  onToggle,
  selectable,
  showActionButtons,
}: any) => {
  const handleCheckBoxChange = () => {
    onToggle(row);
  };

  return (
    <DataTableRow key={row.index.value} selected={isChecked}>
      {selectable && (
        <DataTableCell width="48px">
          <Checkbox onChange={handleCheckBoxChange} checked={isChecked} />
        </DataTableCell>
      )}
      {columns.map((col: any) => {
        if (col.key === 'actions') {
          return (
            <DataTableCell key={col.key}>
              {actionOptions && showActionButtons && (
                <DataTableActions
                  actionOptions={actionOptions}
                  data={row}
                  actionOptionOrientation={actionOptionOrientation}
                  onClick={(option) => {
                    const data = row['responseData']?.['value'];
                    if (option.onClick) option.onClick(data);
                    actionSelected.emit({
                      action: option.label,
                      data,
                    });
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
};
