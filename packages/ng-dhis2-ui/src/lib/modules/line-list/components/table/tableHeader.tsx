import {
  DataTableColumnHeader,
  DataTableRow,
  TableHead,
  Checkbox,
} from '@dhis2/ui';
import React, { useState } from 'react';
import { TableRow } from '../../models/line-list.models';

// export const TableHeader = ({
//   columns,
//   data,
// }: {
//   columns: any[];
//   data: TableRow;
// }) => {
//   const [checked, setChecked] = useState(false);

//   const handleCheckboxChange = () => {
//     const newChecked = !checked;
//     setChecked(newChecked);
//     console.log('Header checkbox toggled. Checked:', newChecked);
//     console.log('Row selected:', data);
//   };

//   return (
//     <TableHead>
//       <DataTableRow>
//         <DataTableColumnHeader width="48px">
//           <Checkbox checked={checked} onChange={handleCheckboxChange} />
//         </DataTableColumnHeader>
//         {columns.map((col) => (
//           <DataTableColumnHeader key={col.key}>
//             {col.label}
//           </DataTableColumnHeader>
//         ))}
//       </DataTableRow>
//     </TableHead>
//   );
// };

export const TableHeader = ({
  columns,
  allSelected,
  onSelectAll,
  selectable,
  showActionButtons
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
