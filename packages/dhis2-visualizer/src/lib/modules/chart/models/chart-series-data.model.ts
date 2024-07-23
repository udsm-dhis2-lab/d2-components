// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import * as _ from 'lodash';
export class ChartSeriesData {
  static get(
    analyticsObject: any,
    chartConfiguration: any,
    yAxisItemId: string,
    xAxisItems: any[]
  ) {
    const data: any[] = [];
    /**
     * Get index to locate data for y axis
     */
    const yAxisItemIndex = _.findIndex(
      analyticsObject.headers,
      _.find(analyticsObject.headers, ['name', chartConfiguration.yAxisType])
    );

    /**
     * Get index for value attribute to get the data
     */
    const dataIndex = _.findIndex(
      analyticsObject.headers,
      _.find(analyticsObject.headers, ['name', 'value'])
    );

    /**
     * Get index to locate data for x axis
     */
    const xAxisItemIndex = _.map(
      chartConfiguration.xAxisType,
      (xAxisType: any) => {
        return _.findIndex(
          analyticsObject.headers,
          _.find(analyticsObject.headers, ['name', xAxisType])
        );
      }
    ).join('_');

    if (xAxisItems) {
      xAxisItems.forEach((xAxisItem) => {
        /**
         * Get the required data depending on xAxis and yAxis
         */
        const seriesValue = ChartSeriesData.getValue(
          analyticsObject.rows,
          yAxisItemIndex,
          yAxisItemId,
          xAxisItemIndex,
          xAxisItem.id,
          dataIndex
        );

        data.push({
          id: xAxisItem.id,
          name: xAxisItem.name,
          dataLabels: ChartSeriesData.getDataLabelsOptions(chartConfiguration),
          y: seriesValue,
        });
      });
    }

    return data;
  }

  static getValue(
    analyticsRows: any,
    yAxisItemIndex: number,
    yAxisItemId: string,
    xAxisItemIndex: string,
    xAxisItemId: string,
    dataIndex: number
  ) {
    let finalValue = 0;
    const seriesValues = _.map(analyticsRows, (row: any[]) => {
      let seriesValue = 0;
      let xAxisRowId = '';
      _.forEach(xAxisItemIndex.split('_'), (axisIndex: any) => {
        xAxisRowId += xAxisRowId !== '' ? '_' : '';
        xAxisRowId += row[axisIndex];
      });

      if (row[yAxisItemIndex] === yAxisItemId && xAxisRowId === xAxisItemId) {
        const value = parseFloat(row[dataIndex]);
        if (isNaN(value)) {
          return row[dataIndex];
        }
        seriesValue += value;
      }
      return seriesValue;
    }).filter((value: number) => value !== 0);

    if (seriesValues) {
      // Check if series values have non numeric content
      if (_.some(seriesValues, (seriesValue: number) => isNaN(seriesValue))) {
        return '';
      }
      // TODO find best way to identify ratios
      const isRatio = _.some(
        seriesValues,
        (seriesValue: { toString: () => string }) =>
          seriesValue.toString().split('.')[1]
      );

      const valueSum =
        seriesValues.length > 0
          ? seriesValues.reduce((sum: any, count: any) => sum + count)
          : 0;

      if (isRatio) {
        finalValue = parseFloat((valueSum / seriesValues.length).toFixed(2));
      } else {
        finalValue = valueSum;
      }
    }

    return finalValue !== 0 ? finalValue : 0;
  }

  static getDataLabelsOptions(chartConfiguration: any) {
    let dataLabels = null;

    switch (chartConfiguration.type) {
      case 'pie':
        dataLabels = {
          enabled: chartConfiguration.showData,
          format:
            '{point.name}<br/> <b>{point.y}</b> ( {point.percentage:.1f} % )',
        };
        break;
      default:
        dataLabels = {
          enabled: chartConfiguration.showData,
        };
        break;
    }

    return dataLabels;
  }

  static combineSeriesData(seriesData: any) {
    let combinedSeriesData: any[] = [];
    seriesData.forEach((seriesDataArray: any[]) => {
      seriesDataArray.forEach((seriesDataObject: { id: any | string }) => {
        const availableSeriesData = _.find(combinedSeriesData, [
          'id',
          seriesDataObject.id,
        ]);
        if (!availableSeriesData) {
          combinedSeriesData = [...combinedSeriesData, seriesDataObject];
        } else {
          const seriesDataIndex = _.findIndex(
            combinedSeriesData,
            availableSeriesData
          );
          const newSeriesObject: any = { ...seriesDataObject };
          newSeriesObject.y += availableSeriesData.y;
          combinedSeriesData = [
            ...combinedSeriesData.slice(0, seriesDataIndex),
            newSeriesObject,
            ...combinedSeriesData.slice(seriesDataIndex + 1),
          ];
        }
      });
    });

    return combinedSeriesData;
  }
}
