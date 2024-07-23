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

  getTableHTMLHeader(tablePayload: TablePayload) {
    return tablePayload.headers.map((tableHeader, tableHeaderIndex) => {
      return `<tr class="header-column">
                    ${tablePayload.hasParentOu ? '<th></th>' : ''}
                    ${tablePayload.columns
                      .map((tableColumn, tableColumnIndex) => {
                        return `<th style="text-align: center">
                                ${
                                  tableColumnIndex ===
                                    tablePayload.columns.length - 1 &&
                                  tableHeaderIndex ===
                                    tablePayload.headers.length - 1 &&
                                  tablePayload.titlesAvailable
                                    ? `<span>${tablePayload?.titles?.rows[tableColumnIndex]} /${tablePayload?.titles?.column[tableHeaderIndex]}</span>`
                                    : ''
                                }

                                ${
                                  tableColumnIndex !==
                                  tablePayload.columns.length - 1
                                    ? `<span>${tablePayload?.titles?.rows[tableColumnIndex]}</span>`
                                    : ''
                                }

                                ${
                                  tableHeaderIndex !==
                                  tablePayload?.headers?.length - 1
                                    ? `<span>${tablePayload?.titles?.column[tableHeaderIndex]}</span>`
                                    : ''
                                }
                             
                                </th>`;
                      })
                      .join('')}
                      ${tableHeader.items
                        .map((headerColumn) => {
                          return `<th colspan="${headerColumn?.span}" style="text-align: center">${headerColumn?.name}</th>`;
                        })
                        .join('')}
                </tr>`;
    });
  }

  getTableBody(tablePayload: TablePayload) {
    return `<tbody id="myPivotTable">
                ${tablePayload.rows
                  .map((row) => {
                    return `<tr>
                                ${row.items
                                  .map((rowItem) => {
                                    return `<td
                                    *ngFor="let header_column of row?.items; let i = index"
                                    ${
                                      rowItem.name !== ''
                                        ? 'class=header-column'
                                        : ''
                                    }
                                    style="text-align: center; vertical-align: middle; background: ${
                                      rowItem && rowItem.isScorecardColorShown
                                        ? rowItem?.scorecardColor
                                          ? rowItem?.scorecardColor
                                          : '#ffffff'
                                        : rowItem?.color
                                    }"
                                    rowspan="${rowItem.row_span}"
                                >
                                    ${rowItem?.val || ''}
                                </td>`;
                                  })
                                  .join('')}
                            </tr>`;
                  })
                  .join('')}
            </tbody>`;
  }
  getTableHTML(tablePayload: TablePayload) {
    return `
    <style>
      .custom-table-container {
        overflow: auto;
        padding: 8px 8px 24px 8px;
      }
     .custom-table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 11px !important;
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
        font-size: 12px;
        font-weight: 600;
        text-align: center;
        background-color: #c7d5e9;
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
    </style>
    <div class="custom-table-container table-responsive" style="height: calc(${
      this._plotOptions?.height
    } - 24px)" >
     <table class="table table-bordered table-condensed custom-table"
        id="pivot_table__${this._id}"
       >
          <thead>
          <!--title-->
          <tr class="table-title">
              <th colspan="${tablePayload?.rows[0]?.items?.length}">
                  <div style="font-size: 13px" class="text-center text-muted">
                      ${tablePayload?.subtitle}
                  </div>
              </th>
          </tr>
          <!--headers-->
          ${this.getTableHTMLHeader(tablePayload)}
          </thead>
        ${this.getTableBody(tablePayload)}
      </table>
    </div>`;
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
        renderingElement?.replaceChildren();
        const tableHTML = this.getTableHTML(tableData);
        renderingElement.innerHTML = tableHTML;
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
