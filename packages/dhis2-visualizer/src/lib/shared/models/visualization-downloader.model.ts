import { DownloadFormat } from './download-format.model';

interface IVisualizationDownloader {
  filename: string;
  htmlTable?: string;
  content?: string;
  downloadFormat?: DownloadFormat;
}
export class VisualizationDownloader {
  filename!: string;
  htmlTable?: any;
  content?: string;
  downloadFormat?: DownloadFormat;
  elementId!: string;
  constructor(config?: IVisualizationDownloader) {
    this.filename = config?.filename || 'filename';
    this.htmlTable = config?.htmlTable;
    this.content = config?.content;
  }

  setElementId(id: string) {
    this.elementId = id;
    return this;
  }

  setFormat(format: DownloadFormat) {
    this.downloadFormat = format;
    return this;
  }

  setFilename(filename: string): VisualizationDownloader {
    this.filename = filename;
    return this;
  }

  setCSV(csvContent: string): VisualizationDownloader {
    this.content = csvContent;
    this.downloadFormat = 'CSV';
    return this;
  }

  download() {
    switch (this.downloadFormat) {
      case 'CSV': {
        const tableElement = document?.getElementById(this.elementId);
        this.content = this.content ?? this._tableToCSV(tableElement);
        this.toCsv();
        break;
      }

      case 'XLS': {
        this.content = document?.getElementById(this.elementId)?.outerHTML;
        this.toXLS();
        break;
      }
      default:
        break;
    }
  }

  toCsv() {
    if (!this.content) {
      throw new Error('CSV content is not supplied');
    }

    const blob = new Blob([this.content], { type: 'text/csv' });

    if ((navigator as any).msSaveOrOpenBlob) {
      (navigator as any).msSaveOrOpenBlob(blob, this.filename + '.csv');
    } else {
      this._downloadAnchor(URL.createObjectURL(blob), 'csv', this.filename);
    }
  }

  toXLS() {
    if (!this.content) {
      throw new Error('CSV content is not supplied');
    }

    const filename = `${this.filename}.xls`;

    const ctx = {
        worksheet: 'Sheet 1',
      },
      base64 = (s: string | number | boolean) =>
        window.btoa(unescape(encodeURIComponent(s))),
      format = (s: string, c: { [x: string]: any; worksheet?: string }) =>
        s.replace(/{(\w+)}/g, (m: any, p: string | number) => c[p]);
    let str =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office' +
      ':excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook>' +
      '<x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>' +
      '</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>td, th {border: solid thin;}</style></head><body>';
    str += this.content + '</body></html>';
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = filename;
      link.href =
        'data:application/vnd.ms-excel;base64,' + base64(format(str, ctx));
      link.click();
    }, 100);
  }

  private _tableToCSV(table: any) {
    const slice = Array.prototype.slice;

    return slice
      .call(table.rows)
      .map(function (row) {
        return slice
          .call(row.cells)
          .map(function (cell) {
            return '"t"'.replace('t', cell.textContent);
          })
          .join(',');
      })
      .join('\r\n');
  }

  private _downloadAnchor(content: any, ext: any, filename: string) {
    const anchor = document.createElement('a');
    anchor.style.display = '!important';
    anchor.id = 'downloadanchor';
    document.body.appendChild(anchor);

    if ('download' in anchor) {
      anchor.download = filename + '.' + ext;
    }
    anchor.href = content;
    anchor.click();
    anchor.remove();
  }
}
