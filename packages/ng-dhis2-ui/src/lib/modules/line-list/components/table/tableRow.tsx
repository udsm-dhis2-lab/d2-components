import { DataTableCell, DataTableRow, Checkbox } from '@dhis2/ui';
import React, { useState } from 'react';
import { DataTableActions } from '../data-table-actions';
import { TableCell } from './tableCell';

// export const TableRow = ({
//   row,
//   columns,
//   getTextColorFromBackGround,
//   actionOptions,
//   actionOptionOrientation,
//   actionSelected,
// }: any) => {
//   const [isChecked, setIsChecked] = useState(false);

//   const handleCheckBoxChange = () => {
//     const newState = !isChecked;
//     setIsChecked(newState);
//     console.log('Row selected:', row, 'Checked:', newState);
//   };

//   return (
//     <DataTableRow key={row.index.value}>
//       <DataTableCell width="48px">
//         <Checkbox
//           onChange={handleCheckBoxChange}
//           value="id_1"
//           checked={isChecked}
//         />
//       </DataTableCell>
//       {columns.map((col: any) => {
//         if (col.key === 'actions') {
//           return (
//             <DataTableCell key={col.key}>
//               {actionOptions && (
//                 <DataTableActions
//                   actionOptions={actionOptions}
//                   actionOptionOrientation={actionOptionOrientation}
//                   onClick={(option) => {
//                     const data = row['responseData']?.['value'];
//                     if (option.onClick) option.onClick(data);
//                     actionSelected.emit({
//                       action: option.label,
//                       data,
//                     });
//                   }}
//                 />
//               )}
//             </DataTableCell>
//           );
//         }

//         return (
//           <TableCell
//             key={col.key}
//             cell={row[col.key]}
//             getTextColorFromBackGround={getTextColorFromBackGround}
//           />
//         );
//       })}
//     </DataTableRow>
//   );
// };

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
              {actionOptions && (
                <DataTableActions
                  actionOptions={actionOptions}
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
