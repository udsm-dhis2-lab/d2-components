// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import * as _ from 'lodash';
import { ChartSeriesData } from './chart-series-data.model';
import { ChartTypeUtil } from '../utils';

export interface ChartSeriesObject {
  name: any;
  id: any;
  index: number;
  turboThreshold: number;
  pointPlacement?: string;
  data: any[];
  type: string;
  states?: { hover: { enabled: boolean } };
  lineWidth?: number;
}
export interface IChartSeries {}

export class ChartSeries implements IChartSeries {
  analyticsObject: any;
  xAxisItems!: any[];
  yAxisItems!: any[];
  chartConfiguration: any;
  series!: ChartSeriesObject[];
  constructor(seriesParams: Partial<ChartSeries>) {
    this.analyticsObject = seriesParams.analyticsObject;
    this.xAxisItems = seriesParams.xAxisItems || [];
    this.yAxisItems = seriesParams.yAxisItems || [];
    this.chartConfiguration = seriesParams.chartConfiguration;
  }

  set() {
    this.series = this.yAxisItems.map((yAxisItem, yAxisIndex) => {
      return {
        name: yAxisItem.name,
        id: yAxisItem.id,
        index: yAxisIndex,
        turboThreshold: 0,
        pointPlacement:
          this.chartConfiguration.type === 'radar' ? 'on' : undefined,
        data: ChartSeriesData.get(
          this.analyticsObject,
          this.chartConfiguration,
          yAxisItem.id,
          this.xAxisItems
        ),
        type: ChartTypeUtil.getAllowedType(
          this.chartConfiguration.type
        ) as string,
      };
    });
    return this;
  }

  sort() {
    let newSeries = [...this.series];
    let seriesCategories: string | any[] = [];
    const sortOrder = this.chartConfiguration.cumulativeValues
      ? -1
      : this.chartConfiguration.sortOrder;

    const combinedSeriesData = [
      ...ChartSeriesData.combineSeriesData(
        _.map(this.series, (seriesObject: { data: any }) => seriesObject.data)
      ),
    ];

    if (sortOrder === 1) {
      seriesCategories = _.map(
        _.reverse(_.sortBy(combinedSeriesData, ['y'])),
        (seriesData: { id: any }) => seriesData.id
      );
      newSeries = _.map(newSeries, (seriesObject: { data: any }) => {
        const newSeriesObject: any = { ...seriesObject };

        if (seriesCategories.length > 0) {
          newSeriesObject.data = [
            ..._.map(seriesCategories, (seriesCategory: any) =>
              _.find(seriesObject.data, ['id', seriesCategory])
            ),
          ];
        }

        return newSeriesObject;
      });
    } else if (sortOrder === -1) {
      seriesCategories = _.map(
        _.sortBy(combinedSeriesData, ['y']),
        (seriesData: { id: any }) => seriesData.id
      );
      newSeries = _.map(this.series, (seriesObject: { data: any }) => {
        const newSeriesObject: any = { ...seriesObject };

        if (seriesCategories.length > 0) {
          newSeriesObject.data = [
            ..._.map(seriesCategories, (seriesCategory: any) =>
              _.find(seriesObject.data, ['id', seriesCategory])
            ),
          ];
        }
        return newSeriesObject;
      });
    }
    this.series = newSeries;
    return this;
  }

  addExtendedOptions() {
    this.series = this.series.map((seriesObject) => {
      const extendedOption = this.chartConfiguration?.seriesOptions?.find(
        (seriesOption: { dimensionItem: any }) =>
          seriesOption.dimensionItem === seriesObject.id
      );

      if (extendedOption) {
        const seriesColor =
          extendedOption.color && extendedOption.color.length > 0
            ? extendedOption.color
            : undefined;

        if (extendedOption.type === 'dotted') {
          seriesObject.lineWidth = 0;
          seriesObject.states = {
            hover: {
              enabled: false,
            },
          };
        }

        return {
          ...seriesObject,
          yAxis: extendedOption.axix || 0,
          type:
            ChartTypeUtil.getAllowedType(extendedOption.type) ||
            seriesObject.type,
          data: seriesColor
            ? seriesObject.data.map((seriesData) => ({
                ...seriesData,
                color: seriesColor,
              }))
            : seriesObject.data,
        };
      }

      return seriesObject;
    });

    return this;
  }

  get() {
    this.set().sort().addExtendedOptions();
    return this.series;
  }
}
