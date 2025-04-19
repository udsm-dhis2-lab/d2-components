import { Pagination as DHISPagination } from '@dhis2/ui';
import { Pager } from '@iapps/d2-web-sdk';
import React from 'react';

type PaginationProps = {
    pager: Pager;
    setPager: React.Dispatch<React.SetStateAction<Pager>>;
  };
 
export const Pagination = ({ pager, setPager }: PaginationProps) => {
    if (!pager || pager.page === undefined || pager.pageSize === undefined) {
        return null; //skip rendering until valid
    }
  
    return (
      <DHISPagination
        page={pager.page}
        pageCount={pager.pageCount}
        pageSize={pager.pageSize}
        total={pager.total}
        onPageChange={(page: number) =>
          setPager((prev: Pager) => new Pager({ ...prev, page }))
        }
        onPageSizeChange={(pageSize: number) =>
          setPager((prev: any) =>
            new Pager({
              ...prev,
              pageSize: Number(pageSize),
              page: 1,
            })
          )
        }
        pageSizes={['10', '20', '50', '100', '500']}
      />
    )
  }
