import { create, first } from 'lodash';
import {
  BaseVisualizer,
  DownloadFormat,
  VisualizationDownloader,
  Visualizer,
  VisualizerPlotOptions,
} from '../../../shared';
import { TablePayload } from '../../map/models/table-object.model';
import { LegendSet } from '../models/legend-set.model';
import { TableAnalytics } from '../models/table-analytics.model';
import { TableConfiguration } from '../models/table-config.model';
import { TableDashboardItem } from '../models/table-dashboard-item.model';
import { D2TableEngine } from './table-engine.util';

function createElement(
  tagName: string,
  options: {
    textContent?: string;
    attributes?: Record<string, string>;
    styles?: Record<string, string>;
  } = {}
): HTMLElement {
  const element: any = document.createElement(tagName);
  if (options.textContent) element.textContent = options.textContent;
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) =>
      element.setAttribute(key, value)
    );
  }
  if (options.styles) {
    Object.entries(options.styles).forEach(
      ([key, value]) => (element.style[key] = value)
    );
  }
  return element;
}

export class TableUtil extends BaseVisualizer implements Visualizer {
  /**
   *
   */
  private tableAnalytics: TableAnalytics | any;
  private tableConfiguration: TableConfiguration | any;
  private tableDashboardItem: TableDashboardItem | any;
  private legendSets: LegendSet[] | any;
  private _plotOptions!: VisualizerPlotOptions;

  /**
   *
   */
  constructor() {
    super();
    this.tableAnalytics = {};
    this.tableConfiguration = {};
    this.legendSets = [];
  }

  /**
   *
   * @param tableDashboardItem
   * @returns
   */
  public setTableDashboardItem(tableDashboardItem: TableDashboardItem) {
    this.tableDashboardItem = tableDashboardItem;
    return this;
  }

  /**
   *
   * @returns
   */
  public getTableDashboardItem() {
    return this.tableDashboardItem;
  }

  /**
   *
   * @param tableAnalytics
   * @returns
   */
  public setTableAnalytics(tableAnalytics: TableAnalytics): TableUtil {
    this.tableAnalytics = tableAnalytics;
    return this;
  }

  /**
   *
   * @returns
   */
  public getTableAnalytics() {
    return this.tableAnalytics;
  }

  /**
   *
   * @param tableConfiguration
   * @returns
   */
  public setTableConfiguration(
    tableConfiguration: TableConfiguration
  ): TableUtil {
    this.tableConfiguration = tableConfiguration;
    return this;
  }

  /**
   *
   * @returns
   */
  public getTableConfiguration() {
    return this.tableConfiguration;
  }

  /**
   *
   * @param legendSets
   * @returns
   */
  setLegendSet(legendSets: LegendSet[]): TableUtil {
    this.legendSets = legendSets;
    return this;
  }

  setPlotOptions(plotOptions: VisualizerPlotOptions) {
    this._plotOptions = plotOptions;
    return this;
  }

  /**
   *
   * @returns
   */
  getLegendSet() {
    return this.legendSets;
  }

  getTableHTMLHeader(tablePayload: TablePayload): HTMLTableSectionElement {
    const thead = createElement('thead') as HTMLTableSectionElement;

    const titleRow = this.getTableTitle(tablePayload);

    thead.appendChild(titleRow);

    tablePayload.headers.forEach((tableHeader, tableHeaderIndex) => {
      const tr = createElement('tr', {
        attributes: {},
      });

      tablePayload.columns.forEach((_, tableColumnIndex) => {
        const th = createElement('th', {
          styles: { textAlign: 'center', padding: '5px' },
        });

        if (
          tableColumnIndex === tablePayload.columns.length - 1 &&
          tableHeaderIndex === tablePayload.headers.length - 1 &&
          tablePayload.titlesAvailable
        ) {
          th.textContent = `${tablePayload?.titles?.rows[tableColumnIndex]} / ${tablePayload?.titles?.column[tableHeaderIndex]}`;
        } else if (tableColumnIndex !== tablePayload.columns.length - 1) {
          th.textContent = tablePayload?.titles?.rows[tableColumnIndex] || '';
        } else if (tableHeaderIndex !== tablePayload?.headers?.length - 1) {
          th.textContent = tablePayload?.titles?.column[tableHeaderIndex] || '';
        }

        tr.appendChild(th);
      });

      tableHeader.items.forEach((headerColumn) => {
        const th = createElement('th', {
          attributes: { colspan: String(headerColumn?.span) },
          styles: { textAlign: 'center', minWidth: '60px' },
        });

        const div = createElement('div', {
          textContent: headerColumn?.name,
          styles: {
            paddingTop: '4px',
            paddingBottom: '4px',
          },
        });

        th.appendChild(div);
        tr.appendChild(th);
      });

      thead.appendChild(tr);
    });

    return thead;
  }

  getTableBody(tablePayload: TablePayload): HTMLTableSectionElement {
    const tbody = createElement('tbody', {
      attributes: { id: 'myPivotTable' },
    }) as HTMLTableSectionElement;

    tablePayload.rows.forEach((row) => {
      const tr = createElement('tr');

      row.items.forEach((rowItem) => {
        const td = createElement('td', {
          attributes: { rowspan: String(rowItem.row_span) },
          styles: {
            textAlign: 'center',
            verticalAlign: 'middle',
            backgroundColor: rowItem?.isScorecardColorShown
              ? rowItem?.scorecardColor || '#ffffff'
              : rowItem?.color || '',
          },
        });

        const div = createElement('div', {
          textContent: (rowItem?.val as any) || '',
          styles: {
            paddingTop: '4px',
            paddingBottom: '4px',
          },
        });

        if (rowItem.name !== '') {
          td.style.minWidth = '180px';
          td.style.backgroundColor = 'rgb(218, 230, 248)';

          div.style;
        }

        td.appendChild(div);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    return tbody;
  }

  getTableHTML(tablePayload: TablePayload): HTMLDivElement {
    const container = createElement('div', {
      attributes: { class: 'custom-table-container table-responsive' },
      styles: { height: `calc(${this._plotOptions?.height} - 24px)` },
    }) as HTMLDivElement;

    const table = createElement('table', {
      attributes: {
        class: 'table table-bordered table-condensed custom-table',
        id: `pivot_table__${this._id}`,
      },
    }) as HTMLTableElement;

    table.appendChild(this.getTableHTMLHeader(tablePayload));
    table.appendChild(this.getTableBody(tablePayload));
    container.appendChild(table);

    return container;
  }

  private getTableTitle(tablePayload: TablePayload) {
    const titleRow = createElement('tr', {
      attributes: { class: 'table-title' },
    });

    const colspan = (first(tablePayload.headers)?.items || [])
      .reduce((colSpan, headerItem) => {
        return colSpan + Number(headerItem.span);
      }, (tablePayload.columns || []).length)
      ?.toString();

    const titleCell = createElement('th', {
      textContent: tablePayload?.subtitle,
      attributes: { colspan },
      styles: { fontSize: '11px', textAlign: 'center' },
    });
    titleRow.appendChild(titleCell);
    return titleRow;
  }

  public draw() {
    const d2TableEngine = new D2TableEngine();

    if (this.tableAnalytics && this.tableConfiguration) {
      const tableData = d2TableEngine.drawTable(
        this.tableAnalytics,
        this.tableConfiguration,
        this.legendSets
      );

      const renderingElement = document.getElementById(
        this.tableConfiguration.id
      );

      if (renderingElement) {
        const style = createElement('style');
        style.textContent = `
         .custom-table-container {
            overflow: auto;
            padding: 8px 8px 40px 8px;
          }
          .custom-table {
            font-family: Arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
            font-size: 11px !important;
            line-height: 11px;
            margin-bottom: 0;
            display: table;
          }
          .custom-table,
          tr,
          td,
          th {
            padding: 4px !important;
          }
          .table-title {
            font-size: 11px;
            font-weight: 600;
            text-align: center;
            background-color: #c7d5e9;
          }
          .header-column {
            background-color: rgb(218, 230, 248) !important;
            padding: 5px !important;
          }
          .table-item-container {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin: 5px;
          }
          .table-item-container > div {
            flex: 1;
          }
          .custom-table th,
          .custom-table td {
            font-weight: 400 !important;
            border: solid thin #bbbbbb;
            text-align: left;
          }
          .custom-table tr th {
            background-color: rgba(238, 238, 238, 0.29);
            padding: 4px;
            text-align: center;
            border-bottom: none;
          }
          .custom-table tr td:first-child {
            background-color: #c7d5e9;
          }
          .custom-table thead tr th {
            background-color: #c7d5e9;
          }
        `;

        renderingElement.replaceChildren();
        const tableHTML = this.getTableHTML(tableData);
        tableHTML.appendChild(style);
        renderingElement.appendChild(tableHTML);
      }
    }
  }

  /**
   *
   * @param downloadFormat
   */
  override download(downloadFormat: DownloadFormat) {
    const filename = this.tableConfiguration?.title || 'table-data';
    switch (downloadFormat) {
      case 'CSV':
      case 'XLS':
        new VisualizationDownloader()
          .setFilename(filename)
          .setElementId(`pivot_table__${this._id}`)
          .setFormat(downloadFormat)
          .download();
        break;
    }
  }
}
