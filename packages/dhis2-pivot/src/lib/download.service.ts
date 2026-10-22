import { DownloadFormat } from './core';

export interface DownloadRequest {
  elementId: string;
  filename: string;
  format: Extract<DownloadFormat, 'CSV' | 'XLS'>;
}

export function tableToCsv(table: HTMLTableElement): string {
  return Array.from(table.rows)
    .map((row) =>
      Array.from(row.cells)
        .map((cell) => `"${(cell.textContent || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\r\n');
}

export class TableDownloadService {
  download({ elementId, filename, format }: DownloadRequest): void {
    const table = document.getElementById(elementId) as HTMLTableElement | null;
    if (!table) throw new Error(`Table element "${elementId}" was not found`);
    const content =
      format === 'CSV' ? tableToCsv(table) : this.toWorkbook(table.outerHTML);
    const type =
      format === 'CSV' ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel';
    const extension = format === 'CSV' ? 'csv' : 'xls';
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    try {
      anchor.hidden = true;
      anchor.href = url;
      anchor.download = `${filename}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
    } finally {
      anchor.remove();
      URL.revokeObjectURL(url);
    }
  }

  private toWorkbook(table: string): string {
    return (
      '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head>' +
      '<meta charset="utf-8"></head><body>' +
      table +
      '</body></html>'
    );
  }
}
