import {
  Checkbox,
  DataTableColumnHeader,
  DataTableRow,
  TableHead,
} from '@dhis2/ui';
import React from 'react';

export const TableHeader = ({
  columns,
  allSelected,
  onSelectAll,
  selectable,
  showActionButtons,
}: {
  columns: any[];
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  selectable: boolean;
  showActionButtons: boolean;
}) => {
  const handleCheckboxChange = () => {
    onSelectAll(!allSelected);
  };

  return (
    <TableHead>
      <DataTableRow>
        {selectable && (
          <DataTableColumnHeader width="48px">
            <Checkbox checked={allSelected} onChange={handleCheckboxChange} />
          </DataTableColumnHeader>
        )}
        {/* {columns.map((col) => (
          <DataTableColumnHeader key={col.key}>
            {col.label}
          </DataTableColumnHeader>
        ))} */}
        {columns
          .filter((col) => showActionButtons || col.key !== 'actions')
          .map((col) => (
            <DataTableColumnHeader key={col.key}>
              {col.label}
            </DataTableColumnHeader>
          ))}
      </DataTableRow>
    </TableHead>
  );
};
