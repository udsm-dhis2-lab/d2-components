export interface TableRow {
  [key: string]: string | number;
  index: number;
}

export interface ColumnDefinition {
  column: string;
  display: string;
  index?: string;
  visible?: boolean;
}
