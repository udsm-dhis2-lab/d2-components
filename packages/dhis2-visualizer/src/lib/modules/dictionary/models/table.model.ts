export type TableColumn = {
  header: string;
  field: string;
  render?: (row: any, col: string, rowIndex: number) => HTMLElement | string;
};