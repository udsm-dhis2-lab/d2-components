// import React from 'react';
// import {
//   TableBody as DHISTableBody,
//   DataTableRow,
//   DataTableCell,
// } from '@dhis2/ui';
// import { TableRow } from './tableRow';

// // export const TableBody = ({
// //   data,
// //   columns,
// //   getTextColorFromBackGround,
// //   actionOptions,
// //   actionOptionOrientation,
// //   actionSelected,
// // }: any) => (
// //   <DHISTableBody>
// //     {data.length > 0 ? (
// //       data.map((row: any) => (
// //         <TableRow
// //           key={row.index.value}
// //           row={row}
// //           columns={columns}
// //           getTextColorFromBackGround={getTextColorFromBackGround}
// //           actionOptions={actionOptions}
// //           actionOptionOrientation={actionOptionOrientation}
// //           actionSelected={actionSelected}
// //         />
// //       ))
// //     ) : (
// //       <DataTableRow>
// //         <DataTableCell
// //           colSpan={columns.length.toString()}
// //           style={{
// //             textAlign: 'center',
// //             fontWeight: 'bold',
// //             color: 'grey',
// //             padding: '20px',
// //           }}
// //         >
// //           No data found
// //         </DataTableCell>
// //       </DataTableRow>
// //     )}
// //   </DHISTableBody>
// // );

// export const TableBody = ({
//   data,
//   columns,
//   getTextColorFromBackGround,
//   actionOptions,
//   rowActionFilterConfig,
//   actionOptionOrientation,
//   actionSelected,
//   selectedRows,
//   onRowToggle,
//   selectable,
//   showActionButtons,
//   error,
// }: any) => (
//   <DHISTableBody>
//     {error ? (
//       <DataTableRow>
//         <DataTableCell
//           colSpan={columns.length.toString()}
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             color: 'red',
//             padding: '20px',
//           }}
//         >
//           {error}
//         </DataTableCell>
//       </DataTableRow>
//     ) : data.length > 0 ? (
//       data.map((row: any) => (
//         <TableRow
//           key={row.index.value}
//           row={row}
//           columns={columns}
//           getTextColorFromBackGround={getTextColorFromBackGround}
//           actionOptions={actionOptions}
//           rowActionFilterConfig={rowActionFilterConfig}
//           actionOptionOrientation={actionOptionOrientation}
//           actionSelected={actionSelected}
//           isChecked={selectedRows.some(
//             (r: { index: { value: any } }) =>
//               r.index?.value === row.index?.value
//           )}
//           onToggle={onRowToggle}
//           selectable={selectable}
//           showActionButtons={showActionButtons}
//         />
//       ))
//     ) : (
//       <DataTableRow>
//         <DataTableCell
//           colSpan={columns.length.toString()}
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             color: 'grey',
//             padding: '20px',
//           }}
//         >
//           No data found
//         </DataTableCell>
//       </DataTableRow>
//     )}
//   </DHISTableBody>
// );


import React, { useMemo } from 'react';
import {
  TableBody as DHISTableBody,
  DataTableRow,
  DataTableCell,
} from '@dhis2/ui';
import { TableRow } from './tableRow';

// export const TableBody = ({
//   data,
//   columns,
//   getTextColorFromBackGround,
//   actionOptions,
//   actionOptionOrientation,
//   actionSelected,
// }: any) => (
//   <DHISTableBody>
//     {data.length > 0 ? (
//       data.map((row: any) => (
//         <TableRow
//           key={row.index.value}
//           row={row}
//           columns={columns}
//           getTextColorFromBackGround={getTextColorFromBackGround}
//           actionOptions={actionOptions}
//           actionOptionOrientation={actionOptionOrientation}
//           actionSelected={actionSelected}
//         />
//       ))
//     ) : (
//       <DataTableRow>
//         <DataTableCell
//           colSpan={String(visibleColumns.length + (selectable ? 1 : 0))}
//           style={{
//             textAlign: 'center',
//             fontWeight: 'bold',
//             color: 'grey',
//             padding: '20px',
//           }}
//         >
//           No data found
//         </DataTableCell>
//       </DataTableRow>
//     )}
//   </DHISTableBody>
// );

export const TableBody = ({
  data,
  columns,
  getTextColorFromBackGround,
  actionOptions,
  rowActionFilterConfig,
  actionOptionOrientation,
  actionSelected,
  selectedIds,
  onRowToggle,
  selectable,
  showActionButtons,
  error,
}: any) => {
  const visibleColumns = useMemo(() => columns.filter((col: any) => showActionButtons || col.key !== 'actions'), [columns, showActionButtons]);
  return <DHISTableBody>
    {error ? (
      <DataTableRow>
        <DataTableCell
          colSpan={String(visibleColumns.length + (selectable ? 1 : 0))}
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'red',
            padding: '20px',
          }}
        >
          {error}
        </DataTableCell>
      </DataTableRow>
    ) : data.length > 0 ? (
      data.map((row: any) => (
        <TableRow
          key={row.responseData?.value?.trackedEntity ?? row.responseData?.value?.event ?? row.index?.value}
          row={row}
          columns={visibleColumns}
          getTextColorFromBackGround={getTextColorFromBackGround}
          actionOptions={actionOptions}
          rowActionFilterConfig={rowActionFilterConfig}
          actionOptionOrientation={actionOptionOrientation}
          actionSelected={actionSelected}
          isChecked={selectedIds.has(row.responseData?.value?.trackedEntity ?? row.responseData?.value?.event ?? row.index?.value)}
          onToggle={onRowToggle}
          selectable={selectable}
          showActionButtons={showActionButtons}
        />
      ))
    ) : (
      <DataTableRow>
        <DataTableCell
          colSpan={String(visibleColumns.length + (selectable ? 1 : 0))}
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
  </DHISTableBody>;
};
