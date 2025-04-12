import {
    DataTableColumnHeader,
    DataTableRow,
    TableHead,
  } from '@dhis2/ui';
import React from 'react';
  
  export const TableHeader = ({ columns }: { columns: any[] }) => (
    <TableHead>
      <DataTableRow>
        {columns.map((col) => (
          <DataTableColumnHeader key={col.key}>
            {col.label}
          </DataTableColumnHeader>
        ))}
      </DataTableRow>
    </TableHead>
  );
  