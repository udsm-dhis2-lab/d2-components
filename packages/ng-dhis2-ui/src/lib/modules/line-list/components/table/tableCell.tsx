import { DataTableCell } from '@dhis2/ui';
import React from 'react';

export const TableCell = ({
  cell,
  getTextColorFromBackGround,
}: {
  cell: any;
  getTextColorFromBackGround: (color: string) => string;
}) => {
  console.log('cel value',cell)
  if (cell?.style && cell?.style !== 'default-value') {
    return (
      <DataTableCell>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span
            style={{
              backgroundColor: cell.style,
              display: 'inline-flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 3,
              fontSize: 12,
              color: getTextColorFromBackGround(cell.style),
            }}
          >
            {cell.value}
          </span>
        </div>
      </DataTableCell>
    );
  }

  return (
    <DataTableCell>
      <div className="text-sm text-gray-800">{cell?.value || '-'}</div>
    </DataTableCell>
  );
};
