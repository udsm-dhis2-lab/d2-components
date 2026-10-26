// // import { DataTable } from '@dhis2/ui';
// // import React from 'react';
// // import { TableHeader } from './tableHeader';
// // //import { TableBody } from './TableBody';
// // import { TableFooter } from './tableFooter';
// // import { TableBody } from './tableBody';

// // export const LineListTable = ({
// //     columns,
// //     data,
// //     pager,
// //     setPager,
// //     getTextColorFromBackGround,
// //     actionOptions,
// //     actionOptionOrientation,
// //     actionSelected,
// //   }: any) => {
// //     return (
// //       <DataTable>
// //         <TableHeader columns={columns} data={data} />
// //         <TableBody
// //           data={data}
// //           columns={columns}
// //           getTextColorFromBackGround={getTextColorFromBackGround}
// //           actionOptions={actionOptions}
// //           actionOptionOrientation={actionOptionOrientation}
// //           actionSelected={actionSelected}
// //         />
// //         <TableFooter columns={columns} pager={pager} setPager={setPager} />
// //       </DataTable>
// //     );
// //   };

// import React, { useState } from 'react';
// import { DataTable } from '@dhis2/ui';
// import { TableHeader } from './tableHeader';
// import { TableBody } from './tableBody';
// import { TableFooter } from './tableFooter';
// import { TableRow } from '../../models/line-list.models';

// export const LineListTable = ({
//   columns,
//   data,
//   pager,
//   setPager,
//   getTextColorFromBackGround,
//   actionOptions,
//   rowActionFilterConfig,
//   actionOptionOrientation,
//   actionSelected,
//   selectable,
//   rowsSelected,
//   showActionButtons,
//   error
// }: any) => {
//   const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);

//   const handleRowToggle = (row: any) => {
//     const exists = selectedRows.find(
//       (r) => r.index?.value === row.index?.value
//     );
//     const updatedRows = exists
//       ? selectedRows.filter((r) => r.index?.value !== row.index?.value)
//       : [...selectedRows, row];

//     setSelectedRows(updatedRows);
//     rowsSelected.emit(
//       updatedRows.map((row: TableRow) => row['responseData']?.value)
//     );
//   };

//   const handleSelectAll = (checked: boolean) => {
//     const updatedRows = checked ? data : [];
//     setSelectedRows(updatedRows);
//     rowsSelected.emit(updatedRows);
//   };

//   return (
//     <DataTable>
//       <TableHeader
//         columns={columns}
//         allSelected={selectedRows.length === data.length && data.length > 0}
//         onSelectAll={handleSelectAll}
//         selectable={selectable}
//         showActionButtons={showActionButtons}
//       />
//       <TableBody
//         data={data}
//         columns={columns}
//         getTextColorFromBackGround={getTextColorFromBackGround}
//         actionOptions={actionOptions}
//         rowActionFilterConfig={rowActionFilterConfig}
//         actionOptionOrientation={actionOptionOrientation}
//         actionSelected={actionSelected}
//         selectedRows={selectedRows}
//         onRowToggle={handleRowToggle}
//         selectable={selectable}
//         showActionButtons={showActionButtons}
//         error={error}
//       />
//       <TableFooter columns={columns} pager={pager} setPager={setPager} />
//     </DataTable>
//   );
// };


import React, { useEffect, useState } from "react";
import { DataTable } from "@dhis2/ui";
import { TableHeader } from "./tableHeader";
import { TableBody } from "./tableBody";
import { TableFooter } from "./tableFooter";
import { TableRow } from "../../models/line-list.models";

export const LineListTable = React.memo(
  ({
    columns,
    data,
    pager,
    setPager,
    getTextColorFromBackGround,
    actionOptions,
    rowActionFilterConfig,
    actionOptionOrientation,
    actionSelected,
    selectable,
    rowsSelected,
    showActionButtons,
    error,
  }: any) => {
    const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);

    // Selection is scoped to the current rendered page. Do not notify Angular
    // with an empty selection on each mount or on unrelated UI changes.
    useEffect(() => {
      if (selectedRows.length > 0) {
        setSelectedRows([]);
        rowsSelected?.emit([]);
      }
      // Page data is the reset boundary; including selectedRows would clear each click.
    }, [pager.page, pager.pageSize, data]);

    const rowId = (row: TableRow) => {
      const value = row["responseData"]?.value as any;
      return value?.trackedEntity ?? value?.event ?? row.index?.value;
    };
    const selectedIds = React.useMemo(
      () => new Set(selectedRows.map(rowId)),
      [selectedRows],
    );

    const handleRowToggle = (row: TableRow) => {
      const id = rowId(row);
      const updatedRows = selectedIds.has(id)
        ? selectedRows.filter((selected) => rowId(selected) !== id)
        : [...selectedRows, row];
      setSelectedRows(updatedRows);
      rowsSelected?.emit(
        updatedRows.map((item) => item["responseData"]?.value),
      );
    };

    const handleSelectAll = (checked: boolean) => {
      const updatedRows = checked ? data : [];
      setSelectedRows(updatedRows);
      rowsSelected?.emit(
        updatedRows.map((row: TableRow) => row["responseData"]?.value),
      );
    };

    return (
      <DataTable>
        <TableHeader
          columns={columns}
          allSelected={selectedRows.length === data.length && data.length > 0}
          onSelectAll={handleSelectAll}
          selectable={selectable}
          showActionButtons={showActionButtons}
        />
        <TableBody
          data={data}
          columns={columns}
          getTextColorFromBackGround={getTextColorFromBackGround}
          actionOptions={actionOptions}
          rowActionFilterConfig={rowActionFilterConfig}
          actionOptionOrientation={actionOptionOrientation}
          actionSelected={actionSelected}
          selectedIds={selectedIds}
          onRowToggle={handleRowToggle}
          selectable={selectable}
          showActionButtons={showActionButtons}
          error={error}
        />
        <TableFooter
          columns={columns.filter(
            (col: any) => showActionButtons || col.key !== "actions",
          )}
          selectable={selectable}
          pager={pager}
          setPager={setPager}
        />
      </DataTable>
    );
  },
);
