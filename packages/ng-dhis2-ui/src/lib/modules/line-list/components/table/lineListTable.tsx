import { DataTable } from '@dhis2/ui';
import React from 'react';
import { TableHeader } from './tableHeader';
import { TableBody } from './TableBody';
import { TableFooter } from './tableFooter';

export const LineListTable = ({
    columns,
    data,
    pager,
    setPager,
    getTextColorFromBackGround,
    actionOptions,
    actionOptionOrientation,
    actionSelected,
  }: any) => {
    return (
      <DataTable>
        <TableHeader columns={columns} />
        <TableBody
          data={data}
          columns={columns}
          getTextColorFromBackGround={getTextColorFromBackGround}
          actionOptions={actionOptions}
          actionOptionOrientation={actionOptionOrientation}
          actionSelected={actionSelected}
        />
        <TableFooter columns={columns} pager={pager} setPager={setPager} />
      </DataTable>
    );
  };
  
