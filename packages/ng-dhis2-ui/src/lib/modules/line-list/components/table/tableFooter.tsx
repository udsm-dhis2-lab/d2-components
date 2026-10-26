
// import { DataTableRow, DataTableCell, TableFoot } from '@dhis2/ui';
// import React from 'react';
// import { Pagination } from './pagination';

// export const TableFooter = ({ pager, setPager, columns }: any) => {
  
//     return (
//       <TableFoot>
//         <DataTableRow>
//           <DataTableCell colSpan={columns.length.toString()}>
//             <Pagination pager={pager} setPager={setPager} />
//           </DataTableCell>
//         </DataTableRow>
//       </TableFoot>
//     );
//   };
  




import { DataTableRow, DataTableCell, TableFoot } from '@dhis2/ui';
import React from 'react';
import { Pagination } from './pagination';

export const TableFooter = ({ pager, setPager, columns, selectable }: any) => {

  return (
    <TableFoot>
      <DataTableRow>
        <DataTableCell colSpan={String(columns.length + (selectable ? 1 : 0))}>
          <Pagination pager={pager} setPager={setPager} />
        </DataTableCell>
      </DataTableRow>
    </TableFoot>
  );
};
