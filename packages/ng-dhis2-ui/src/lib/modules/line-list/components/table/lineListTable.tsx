// import { DataTable } from '@dhis2/ui';
// import React from 'react';
// import { TableHeader } from './tableHeader';
// //import { TableBody } from './TableBody';
// import { TableFooter } from './tableFooter';
// import { TableBody } from './tableBody';

// export const LineListTable = ({
//     columns,
//     data,
//     pager,
//     setPager,
//     getTextColorFromBackGround,
//     actionOptions,
//     actionOptionOrientation,
//     actionSelected,
//   }: any) => {
//     return (
//       <DataTable>
//         <TableHeader columns={columns} data={data} />
//         <TableBody
//           data={data}
//           columns={columns}
//           getTextColorFromBackGround={getTextColorFromBackGround}
//           actionOptions={actionOptions}
//           actionOptionOrientation={actionOptionOrientation}
//           actionSelected={actionSelected}
//         />
//         <TableFooter columns={columns} pager={pager} setPager={setPager} />
//       </DataTable>
//     );
//   };

import React, { useState } from 'react';
import { DataTable } from '@dhis2/ui';
import { TableHeader } from './tableHeader';
import { TableBody } from './tableBody';
import { TableFooter } from './tableFooter';
import { TableRow } from '../../models/line-list.models';

export const LineListTable = ({
  columns,
  data,
  pager,
  setPager,
  getTextColorFromBackGround,
  actionOptions,
  actionOptionOrientation,
  actionSelected,
  selectable,
  selectedRowsData
}: any) => {
  const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);

  const handleRowToggle = (row: any) => {
    const exists = selectedRows.find(
      (r) => r.index?.value === row.index?.value
    );
    const updatedRows = exists
      ? selectedRows.filter((r) => r.index?.value !== row.index?.value)
      : [...selectedRows, row];

    setSelectedRows(updatedRows);
    selectedRowsData.emit(updatedRows);
  };

  const handleSelectAll = (checked: boolean) => {
    const updatedRows = checked ? data : [];
    setSelectedRows(updatedRows);
    selectedRowsData.emit(updatedRows);
  };

  return (
    <DataTable>
      <TableHeader
        columns={columns}
        allSelected={selectedRows.length === data.length && data.length > 0}
        onSelectAll={handleSelectAll}
        selectable={selectable}
      />
      <TableBody
        data={data}
        columns={columns}
        getTextColorFromBackGround={getTextColorFromBackGround}
        actionOptions={actionOptions}
        actionOptionOrientation={actionOptionOrientation}
        actionSelected={actionSelected}
        selectedRows={selectedRows}
        onRowToggle={handleRowToggle}
        selectable={selectable}
      />
      <TableFooter columns={columns} pager={pager} setPager={setPager} />
    </DataTable>
  );
};
