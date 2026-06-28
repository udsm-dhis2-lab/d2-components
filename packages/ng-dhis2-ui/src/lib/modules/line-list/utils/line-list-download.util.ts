import * as XLSX from 'xlsx';
import { ColumnDefinition, TableRow } from '../models/line-list.models';

const getCellValue = (cell: any): any => {
  if (cell === null || cell === undefined) return '';

  if (typeof cell === 'object') {
    if ('value' in cell) return cell.value;
    return JSON.stringify(cell);
  }

  return cell;
};

const getExportColumns = (columns: ColumnDefinition[]) =>
  columns.filter((column) => column.label !== 'Actions');

export const downloadLineListExcel = (
  columns: ColumnDefinition[],
  data: TableRow[],
  fileName = 'records'
) => {
  const exportColumns = getExportColumns(columns);
  const header = exportColumns.map((column) => column.label);
  const rows = data.map((row) =>
    exportColumns.map((column) => getCellValue(row[column.key]))
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'LineListData');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const downloadLineListCsv = (
  columns: ColumnDefinition[],
  data: TableRow[],
  fileName = 'records'
) => {
  const exportColumns = getExportColumns(columns);
  const escapeCsvValue = (value: any) =>
    `"${String(getCellValue(value)).replace(/"/g, '""')}"`;

  const header = exportColumns.map((column) => escapeCsvValue(column.label));
  const rows = data.map((row) =>
    exportColumns.map((column) => escapeCsvValue(row[column.key]))
  );
  const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
