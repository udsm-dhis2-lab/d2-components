// import * as XLSX from 'xlsx';
// import { ColumnDefinition, TableRow } from '../models/line-list.models';

// const getCellValue = (cell: any): any => {
//   if (cell === null || cell === undefined) return '';

//   if (typeof cell === 'object') {
//     if ('value' in cell) return cell.value;
//     return JSON.stringify(cell);
//   }

//   return cell;
// };

// const getExportColumns = (columns: ColumnDefinition[]) =>
//   columns.filter((column) => column.label !== 'Actions');

// export const downloadLineListExcel = (
//   columns: ColumnDefinition[],
//   data: TableRow[],
//   fileName = 'records'
// ) => {
//   const exportColumns = getExportColumns(columns);
//   const header = exportColumns.map((column) => column.label);
//   const rows = data.map((row) =>
//     exportColumns.map((column) => getCellValue(row[column.key]))
//   );

//   const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
//   const workbook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(workbook, worksheet, 'LineListData');
//   XLSX.writeFile(workbook, `${fileName}.xlsx`);
// };

// export const downloadLineListCsv = (
//   columns: ColumnDefinition[],
//   data: TableRow[],
//   fileName = 'records'
// ) => {
//   const exportColumns = getExportColumns(columns);
//   const escapeCsvValue = (value: any) =>
//     `"${String(getCellValue(value)).replace(/"/g, '""')}"`;

//   const header = exportColumns.map((column) => escapeCsvValue(column.label));
//   const rows = data.map((row) =>
//     exportColumns.map((column) => escapeCsvValue(row[column.key]))
//   );
//   const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');

//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');

//   link.href = url;
//   link.setAttribute('download', `${fileName}.csv`);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   URL.revokeObjectURL(url);
// };

import * as XLSX from 'xlsx';
import { ColumnDefinition, TableRow } from '../models/line-list.models';

const cellValue = (cell: unknown): string => {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'object') {
    if ('value' in cell) return cellValue(cell.value);
    return JSON.stringify(cell);
  }
  return String(cell);
};

/**
 * Avoid CSV/Excel formula injection. Leading whitespace and ASCII control
 * characters are ignored when testing for a formula prefix. Scanning the
 * prefix avoids the no-control-regex lint violation without weakening safety.
 */
const spreadsheetSafe = (value: string): string => {
  let index = 0;

  while (index < value.length) {
    const character = value[index];
    const codePoint = character.charCodeAt(0);
    if (codePoint <= 0x1f || character.trim() === '') {
      index += 1;
      continue;
    }
    break;
  }

  return /^[=+\-@]/.test(value.slice(index)) ? `'${value}` : value;
};

const columnsForExport = (columns: ColumnDefinition[]): ColumnDefinition[] =>
  columns.filter(
    (column) => column.key !== 'actions' && column.label !== 'Actions'
  );

const toRows = (columns: ColumnDefinition[], data: TableRow[]): string[][] => {
  const selected = columnsForExport(columns);
  return [
    selected.map((column) => spreadsheetSafe(column.label)),
    ...data.map((row) =>
      selected.map((column) => spreadsheetSafe(cellValue(row[column.key])))
    ),
  ];
};

export function downloadLineListExcel(
  columns: ColumnDefinition[],
  data: TableRow[],
  fileName = 'line-list-results'
): void {
  const rows = toRows(columns, data);
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Line List');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function downloadLineListCsv(
  columns: ColumnDefinition[],
  data: TableRow[],
  fileName = 'line-list-results'
): void {
  const escapeCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;
  const content = toRows(columns, data)
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n');
  // A UTF-8 BOM makes non-ASCII DHIS2 field labels open correctly in Excel.
  const blob = new Blob(['\uFEFF', content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
