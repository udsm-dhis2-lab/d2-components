import { TableDrawable } from '../class/table-drawable.class';
import { Legend, LegendSet } from '../models/legend-set.model';
import { TableConfiguration } from '../models/table-config.model';
import * as _ from 'lodash';
import {
  RowItem,
  TablePayload,
  TableRow,
} from '../../map/models/table-object.model';
import { VisualizationTitle } from '../../../shared/models/visualization-title.model';

/**
 *
 */
export class D2TableEngine extends TableDrawable {
  override useByDataItemLegend = 'BY_DATA_ITEM';

  /**
   * @description Set map type
   */
  constructor() {
    super();
  }

  /**
   *
   * @param favoriteObject
   * @param visualizationLayout
   * @param type
   * @returns
   */
  public getTableConfiguration(
    favoriteObject: any,
    visualizationLayout: any,
    type: string
  ): TableConfiguration {
    return {
      id: `${favoriteObject ? favoriteObject.id : _.random(1000, 1000)}_table`,
      title:
        favoriteObject && favoriteObject.displayName
          ? favoriteObject.displayName
          : favoriteObject && favoriteObject.name
          ? favoriteObject.name
          : '',
      subtitle:
        favoriteObject && favoriteObject.subtitle
          ? favoriteObject.subtitle
          : '',
      showColumnTotal:
        favoriteObject && favoriteObject.colTotal
          ? favoriteObject.colTotal
          : true,
      showColumnSubtotal:
        favoriteObject && favoriteObject.colSubtotal
          ? favoriteObject.colSubtotal
          : true,
      showRowTotal:
        favoriteObject && favoriteObject.rowTotal
          ? favoriteObject.rowTotal
          : true,
      showRowSubtotal:
        favoriteObject && favoriteObject.rowSubtotal
          ? favoriteObject.rowSubtotal
          : true,
      showDimensionLabels:
        favoriteObject && favoriteObject.showDimensionLabels
          ? favoriteObject.showDimensionLabels
          : true,
      hideEmptyRows:
        favoriteObject && favoriteObject.hideEmptyRows
          ? favoriteObject.hideEmptyRows
          : true,
      showHierarchy:
        favoriteObject && favoriteObject.showHierarchy
          ? favoriteObject.showHierarchy
          : true,
      displayList: this.checkForEventDataType(favoriteObject, type),
      rows: visualizationLayout.rows ? visualizationLayout.rows : ['pe'],
      columns: visualizationLayout.columns
        ? visualizationLayout.columns
        : ['dx'],
      filters: visualizationLayout.filters
        ? visualizationLayout.filters
        : ['ou'],
      legendSet: favoriteObject.legendSet || null,
      legendDisplayStrategy: favoriteObject.legendDisplayStrategy,
      styles: null,
    };
  }

  /**
   *
   * @param favoriteObject
   * @param favoriteType
   * @returns
   */
  public checkForEventDataType(
    favoriteObject: any,
    favoriteType: any
  ): boolean {
    let displayList = false;
    if (favoriteType === 'EVENT_REPORT') {
      if (
        favoriteObject &&
        favoriteObject.dataType &&
        favoriteObject.dataType === 'EVENTS'
      ) {
        displayList = true;
      }
    }
    return displayList;
  }

  public drawTable(
    analyticsObject: any,
    tableConfiguration: TableConfiguration,
    legendSets: LegendSet[]
  ) {
    const legendClasses = tableConfiguration.legendSet
      ? tableConfiguration.legendSet.legends
      : null;

    const table: any = {
      headers: [],
      columns: [],
      rows: [],
      titles: {
        rows: [],
        column: [],
      },
      titlesAvailable: false,
      hasParentOu: false,
    };

    const visualizationTitle = new VisualizationTitle(
      tableConfiguration,
      analyticsObject
    );
    if (tableConfiguration && tableConfiguration.title) {
      table['title'] = visualizationTitle.getTitle();
    }

    table['subtitle'] = visualizationTitle.getSubtitle();

    if (tableConfiguration.displayList) {
      table.headers[0] = {
        items: [],
        style: '',
      };
      tableConfiguration.columns[tableConfiguration.columns.indexOf('pe')] =
        'eventdate';
      tableConfiguration.columns[tableConfiguration.columns.indexOf('ou')] =
        'ouname';
      for (const item of tableConfiguration.columns) {
        table.headers[0].items.push({
          name: analyticsObject.headers[
            this.getTitleIndex(analyticsObject.headers, item)
          ].column,
          span: 1,
        });
      }
      for (const item of analyticsObject.rows) {
        const column_items = [];
        for (const col of tableConfiguration.columns) {
          const index = this.getTitleIndex(analyticsObject.headers, col);
          column_items.push({
            name: '',
            display: true,
            row_span: '1',
            // color:getColor(item[index],)
            val: item[index],
          });
        }
        table.rows.push({
          headers: [],
          items: column_items,
        });
      }
    } else {
      // add names to titles array
      if (tableConfiguration.showDimensionLabels) {
        table.titlesAvailable = true;
        for (const item of tableConfiguration.columns) {
          table.titles.column.push(
            analyticsObject.headers[
              this.getTitleIndex(analyticsObject.headers, item)
            ].column
          );
        }
        for (const item of tableConfiguration.rows) {
          table.titles.rows.push(
            analyticsObject.headers[
              this.getTitleIndex(analyticsObject.headers, item)
            ].column
          );
        }
      }

      for (const columnItem of tableConfiguration.columns) {
        const dimension = this.calculateColSpan(
          analyticsObject,
          tableConfiguration.columns,
          columnItem
        );
        const currentColumnItems = this.prepareSingleCategories(
          analyticsObject,
          columnItem
        );
        const headerItem = [];
        for (let i = 0; i < dimension.duplication; i++) {
          for (const currentItem of currentColumnItems) {
            headerItem.push({
              name: currentItem.name,
              span: dimension.col_span,
              type: currentItem.type,
              id: currentItem.uid,
            });
          }
        }

        let styles = '';
        if (tableConfiguration && tableConfiguration.style) {
          if (
            tableConfiguration &&
            tableConfiguration.styles &&
            tableConfiguration.styles[columnItem]
          ) {
            styles = tableConfiguration.styles[columnItem];
          }
        }
        table.headers.push({ items: headerItem, style: styles });
      }
      for (const rowItem of tableConfiguration.rows) {
        table.columns.push(rowItem);
      }

      // Preparing table columns
      const column_length = tableConfiguration.columns.length;
      const column_items_array = [];
      for (let i = 0; i < column_length; i++) {
        const currentRowItems = this.prepareSingleCategories(
          analyticsObject,
          tableConfiguration.columns[i]
        );
        column_items_array.push(currentRowItems);
      }
      let table_columns_array = [];
      for (let i = 0; i < column_items_array.length; i++) {
        if (table_columns_array.length === 0) {
          for (const item of column_items_array[i]) {
            table_columns_array.push([item]);
          }
        } else {
          const temp_arr: any = table_columns_array.concat();
          table_columns_array = [];
          for (const item of temp_arr) {
            for (const val of column_items_array[i]) {
              if (item instanceof Array) {
                const tempArr = Array.from(item);
                table_columns_array.push(tempArr.concat([val]));
              } else {
                table_columns_array.push([item, val]);
              }
            }
          }
        }
      }

      // Preparing table rows
      const rows_length = tableConfiguration.rows.length;
      const row_items_array: any = [];
      for (let i = 0; i < rows_length; i++) {
        const dimension = this.calculateColSpan(
          analyticsObject,
          tableConfiguration.rows,
          tableConfiguration.rows[i]
        );
        const currentRowItems = this.prepareSingleCategories(
          analyticsObject,
          tableConfiguration.rows[i]
        );
        row_items_array.push({ items: currentRowItems, dimensions: dimension });
      }
      let table_rows_array = [];
      for (let i = 0; i < row_items_array.length; i++) {
        if (table_rows_array.length === 0) {
          for (const item of row_items_array[i].items) {
            item.dimensions = row_items_array[i].dimensions;
            table_rows_array.push([item]);
          }
        } else {
          const temp_arr: any = table_rows_array.concat();
          table_rows_array = [];
          for (const item of temp_arr) {
            for (const val of row_items_array[i].items) {
              val.dimensions = row_items_array[i].dimensions;
              if (item instanceof Array) {
                const tempArr = Array.from(item);
                table_rows_array.push(tempArr.concat([val]));
              } else {
                table_rows_array.push([item, val]);
              }
            }
          }
        }
      }

      let counter = 0;
      if (table_rows_array.length !== 0) {
        for (const rowItem of table_rows_array) {
          const item: any = {
            items: [],
            headers: rowItem,
          };
          for (const val of rowItem) {
            if (counter === 0 || counter % val.dimensions.col_span === 0) {
              item.items.push({
                type: val.type,
                name: val.uid,
                val: val.name,
                row_span: val.dimensions.col_span,
                header: true,
              });
            }
          }
          for (const colItem of table_columns_array) {
            const dataItem = [];
            for (const val of rowItem) {
              dataItem.push({ type: val.type, value: val.uid });
            }
            for (const val of colItem) {
              dataItem.push({ type: val.type, value: val.uid });
            }
            item.items.push({
              name: '',
              val: this.getDataValue(analyticsObject, dataItem),
              color: this.getDataValueColor(
                this.getLegendSets(
                  dataItem,
                  legendClasses,
                  legendSets,
                  tableConfiguration,
                  analyticsObject.metaData
                ),
                this.getDataValue(analyticsObject, dataItem)
              ),
              scorecardColor: this.getItemColor(
                tableConfiguration.legendSet,
                this.getDataValue(analyticsObject, dataItem)
              ),
              isScorecardColorShown: false,
              row_span: '1',
              display: true,
            });
          }

          if (tableConfiguration && tableConfiguration.hideEmptyRows) {
            if (!this.checkZeros(tableConfiguration.rows.length, item.items)) {
              table.rows.push(item);
            }
          } else {
            table.rows.push(item);
          }

          counter++;
        }
      } else {
        const item: any = {
          items: [],
          headers: [],
        };
        for (const colItem of table_columns_array) {
          const dataItem = [];
          for (const val of colItem) {
            dataItem.push({ type: val.type, value: val.uid });
          }
          item.items.push({
            name: '',
            val: this.getDataValue(analyticsObject, dataItem),
            row_span: '1',
            display: true,
          });
        }
        if (tableConfiguration && tableConfiguration.hideEmptyRows) {
          if (!this.checkZeros(tableConfiguration.rows.length, item.items)) {
            table.rows.push(item);
          }
        } else {
          table.rows.push(item);
        }
      }
    }
    // todo improve total options to also work for event table
    // return _getSanitizedTableObject(table, tableConfiguration);
    return tableConfiguration && tableConfiguration.isConsecutivePeDiff
      ? this.getDifferenceInConsecutivePe(tableConfiguration.legendSet, table)
      : table;
  }

  public getDifferenceInConsecutivePe(legenSet: any, table: TablePayload) {
    return {
      ...table,
      headers: [
        {
          ...table.headers[0],
          items: [
            ...table.headers[0].items,
            {
              name: 'Indicator Difference',
              span: 1,
              type: 'pe',
              id: 'Indicator Difference',
            },
          ],
        },
      ],
      rows: [
        ..._.map(table.rows, (tableRow: TableRow) => {
          const rowItemToCalculate: RowItem[] = _.take(
            _.reverse(tableRow.items),
            2
          );
          const difference: number =
            +(rowItemToCalculate && rowItemToCalculate[0]
              ? rowItemToCalculate[0].val
              : 1) -
            +(rowItemToCalculate && rowItemToCalculate[1]
              ? +rowItemToCalculate[1].val
              : 1);
          return {
            ...tableRow,
            items: [
              ..._.takeRight(tableRow.items),
              ..._.dropRight(tableRow.items),
              {
                name: '',
                val: difference,
                scorecardColor: this.getItemColor(legenSet, difference),
                isScorecardColorShown: true,
                row_span: '1',
                display: true,
              },
            ],
          };
        }),
      ],
    };
  }

  public getItemColor(legendSet: any, value: number) {
    // Implement Method
    if (legendSet?.legends?.length > 0) {
      const selectedLegends: Legend[] = _.filter(
        legendSet.legends,
        (legend: Legend) => {
          return value >= legend.startValue && value < legend.endValue;
        }
      ) as Legend[];
      return selectedLegends &&
        selectedLegends.length &&
        _.head(selectedLegends) &&
        _.head(selectedLegends)?.color
        ? _.head(selectedLegends)?.color
        : '#0099cc';
    }
    return '';
  }

  /**
   *
   * @param analyticsObjectHeaders
   * @param name
   * @returns
   */
  public getTitleIndex(analyticsObjectHeaders: any, name: string) {
    let index = 0;
    let counter = 0;
    for (const header of analyticsObjectHeaders) {
      if (header.name === name) {
        index = counter;
      }
      counter++;
    }
    return index;
  }

  /**
   *
   * @param analyticsObject
   * @param array
   * @param item
   * @returns
   */
  public calculateColSpan(analyticsObject: any, array: any, item: any) {
    const indexOfItem = array.indexOf(item);
    const array_length = array.length;
    const last_index = array_length - 1;
    const dimensions = { col_span: 1, duplication: 1 };
    for (let i = last_index; i > indexOfItem; i--) {
      const arr = this.prepareSingleCategories(analyticsObject, array[i]);
      dimensions.col_span = dimensions.col_span * arr.length;
    }
    for (let i = 0; i < indexOfItem; i++) {
      const arr = this.prepareSingleCategories(analyticsObject, array[i]);
      dimensions.duplication = dimensions.duplication * arr.length;
    }
    return dimensions;
  }

  /**
   *
   * @param initialAnalytics
   * @param itemIdentifier
   * @param preDefinedItems
   * @returns
   */
  public prepareSingleCategories(
    initialAnalytics: any,
    itemIdentifier: any,
    preDefinedItems?: any
  ) {
    preDefinedItems = preDefinedItems || [];
    const analyticsObject = this.sanitizeIncomingAnalytics(initialAnalytics);
    const structure = [];
    if (preDefinedItems && preDefinedItems.length === 0) {
      for (const val of this.getMetadataArray(
        analyticsObject,
        itemIdentifier.dimension
      )) {
        structure.push({
          name: analyticsObject.metaData.names[val],
          uid: val,
          type: itemIdentifier.dimension,
        });
      }
    }
    if (preDefinedItems && preDefinedItems.length !== 0) {
      for (const val of preDefinedItems) {
        structure.push({
          name: analyticsObject.metaData.names[val],
          uid: val,
          type: itemIdentifier.dimension,
        });
      }
    }
    return structure;
  }

  /**
   *
   * @param analyticsObject
   * @returns
   */
  public sanitizeIncomingAnalytics(analyticsObject: any) {
    return analyticsObject;
  }

  /**
   *
   * @param analyticsObject
   * @param metadataType
   * @returns
   */
  public getMetadataArray(analyticsObject: any, metadataType: string) {
    let metadataArray = [];
    if (metadataType === 'dx') {
      metadataArray = analyticsObject.metaData.dx;
    } else if (metadataType === 'ou') {
      metadataArray = analyticsObject.metaData.ou;
    } else if (metadataType === 'co') {
      metadataArray = analyticsObject.metaData.co;
    } else if (metadataType === 'pe') {
      metadataArray =
        analyticsObject &&
        analyticsObject.metaData &&
        analyticsObject.metaData.pe
          ? analyticsObject.metaData.pe
          : analyticsObject.metaData.dimensions.pe;
    } else {
      metadataArray = analyticsObject.metaData[metadataType];
    }

    return metadataArray;
  }

  /**
   *
   * @param analyticsObject
   * @param dataItems
   * @returns
   */
  public getDataValue(analyticsObject: any, dataItems: any) {
    let num = null;
    for (const value of analyticsObject.rows) {
      let counter = 0;
      for (const item of dataItems) {
        if (
          value[this.getTitleIndex(analyticsObject.headers, item.type)] ===
          item.value
        ) {
          counter++;
        }
      }
      if (counter === dataItems.length) {
        if (
          isNaN(value[this.getTitleIndex(analyticsObject.headers, 'value')])
        ) {
          num = value[this.getTitleIndex(analyticsObject.headers, 'value')];
        } else {
          num += parseFloat(
            value[this.getTitleIndex(analyticsObject.headers, 'value')]
          );
        }
      }
    }
    return num;
  }

  /**
   *
   * @param legendItems
   * @param value
   * @returns
   */
  public getDataValueColor(legendItems: any, value: any) {
    const isLast = (index: any) => index === legendItems.length - 1;
    const dataItem =
      value &&
      (legendItems || []).find(
        (item: any, index: any) =>
          value >= item.startValue &&
          (value < item.endValue || (isLast(index) && value === item.endValue))
      );

    return dataItem && dataItem.color;
  }

  /**
   *
   * @param dataItem
   * @param legendClasses
   * @param legendSets
   * @param configuration
   * @param metaData
   */
  public getLegendSets(
    dataItem: any,
    legendClasses: any,
    legendSets: any,
    configuration: any,
    metaData: any
  ) {
    const { legendDisplayStrategy } = configuration;
    const { items } = metaData;

    if (legendDisplayStrategy === this.useByDataItemLegend) {
      const dx = dataItem.find((dItem: any) => dItem.type === 'dx');
      const legendSetId =
        dx && dx.value && items[dx.value] && items[dx.value]['legendSet'];
      const legendSet =
        legendSetId &&
        legendSets &&
        legendSets.find(({ id }: any) => id === legendSetId);
      return legendSet && legendSet.legends;
    }
    return legendClasses;
  }

  /**
   *
   * @param stating_length
   * @param array
   * @returns
   */
  public checkZeros(stating_length: any, array: any) {
    let checker = true;
    for (let i = stating_length; i < array.length; i++) {
      if (array[i].name === '' && array[i].val != null) {
        checker = false;
      }
    }
    return checker;
  }
}
