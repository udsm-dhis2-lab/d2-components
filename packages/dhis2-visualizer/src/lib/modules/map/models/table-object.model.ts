export interface TablePayload {
  headers: TablePayloadHeader[];
  columns: string[];
  rows: TableRow[];
  titles: Titles;
  titlesAvailable: boolean;
  hasParentOu: boolean;
  title: string;
  subtitle: string;
}

export interface TablePayloadHeader {
  items: HeaderItem[];
  style: string;
}

export interface HeaderItem {
  name: string;
  span: number;
  type: string;
  id: string;
}

export interface TableRow {
  items: RowItem[];
  headers: RowHeader[];
}

export interface RowHeader {
  name: string;
  uid: string;
  type: string;
  dimensions: Dimensions;
}

export interface Dimensions {
  col_span: number;
  duplication: number;
}

export interface RowItem {
  type?: string;
  name: string;
  val: number | string;
  row_span: number | string;
  header?: boolean;
  display?: boolean;
  isScorecardColorShown?: boolean;
  scorecardColor?: string;
  color?: string;
}

export interface Titles {
  rows: string[];
  column: string[];
}
