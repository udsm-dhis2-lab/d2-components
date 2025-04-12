import React from 'react';
import { TableBody as DHISTableBody, DataTableRow, DataTableCell } from '@dhis2/ui';
import { TableRow } from './tableRow';


export const TableBody = ({
  data,
  columns,
  getTextColorFromBackGround,
  actionOptions,
  actionOptionOrientation,
  actionSelected,
}: any) => (
  <DHISTableBody>
    {data.length > 0 ? (
      data.map((row: any) => (
        <TableRow
          key={row.index.value}
          row={row}
          columns={columns}
          getTextColorFromBackGround={getTextColorFromBackGround}
          actionOptions={actionOptions}
          actionOptionOrientation={actionOptionOrientation}
          actionSelected={actionSelected}
        />
      ))
    ) : (
      <DataTableRow>
        <DataTableCell
          colSpan={columns.length.toString()}
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'grey',
            padding: '20px',
          }}
        >
          No data found
        </DataTableCell>
      </DataTableRow>
    )}
  </DHISTableBody>
);
