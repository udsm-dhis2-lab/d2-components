export class Pager {
  pageSize: number;
  pageCount?: number;
  page: number;
  paging: boolean;
  total?: number;
  index?: number;
  pageOffset?: number;

  constructor(pager?: Partial<Pager>) {
    this.pageSize = pager?.pageSize || 50;
    this.page = pager?.page || 1;
    this.paging = pager?.paging || true;
    this.total = pager?.total;
    this.index = this.#getIndex();
    this.pageCount = pager?.pageCount;
    this.pageOffset = this.#getOffset();
  }

  #getIndex(): number {
    return this.page, this.pageSize * (this.page - 1);
  }

  #getOffset(): number {
    return (this.page - 1) * this.pageSize;
  }

  getPagingQueryParams(): string {
    if (!this.paging) {
      return 'paging=false';
    }

    return `page=${this.page || 1}&pageSize=${
      this.pageSize || 50
    }&skipPaging=false&totalPages=true`;
  }
}
