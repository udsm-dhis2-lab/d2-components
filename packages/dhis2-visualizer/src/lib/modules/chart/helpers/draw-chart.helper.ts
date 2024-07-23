import * as _ from 'lodash';
import { ChartAxisUtil } from '../utils';
import { ChartSeries } from '../models';

export function drawChart(
  incomingAnalyticsObject: any,
  chartConfiguration: any
): any {
  const analyticsObject = sanitizeAnalyticsBasedOnConfiguration(
    incomingAnalyticsObject,
    chartConfiguration
  );

  let chartObject: any = {
    chart: getChartAttributeOptions(chartConfiguration),
    title: getChartTitleObject(chartConfiguration, analyticsObject),
    subtitle: '',
    credits: getChartCreditsOptions(),
    colors: getChartColors(),
    plotOptions: getPlotOptions(chartConfiguration),
    tooltip: getTooltipOptions(chartConfiguration),
    exporting: getChartExportingOptions(),
    // legend: getLegendOptions(chartConfiguration)
  };

  /**
   * Extend chart options depending on type
   */

  const newChartConfiguration = _.clone(chartConfiguration);

  switch (chartConfiguration.type) {
    case 'radar':
      chartObject = extendSpiderWebChartOptions(
        chartObject,
        analyticsObject,
        chartConfiguration
      );
      break;
    case 'solidgauge':
      chartObject = extendSolidGaugeChartOptions(
        chartObject,
        analyticsObject,
        chartConfiguration
      );
      break;
    case 'gauge':
      newChartConfiguration.type = 'solidgauge';
      chartObject = extendSolidGaugeChartOptions(
        chartObject,
        analyticsObject,
        newChartConfiguration
      );
      break;
    case 'pie':
      chartObject = extendPieChartOptions(
        chartObject,
        analyticsObject,
        chartConfiguration
      );
      break;
    case 'combined':
      break;
    default:
      chartObject = extendOtherChartOptions(
        chartObject,
        analyticsObject,
        chartConfiguration
      );
      break;
  }

  return getSanitizedChartObject(chartObject, chartConfiguration);
}

function extendSpiderWebChartOptions(
  initialChartObject: any,
  analyticsObject: any,
  chartConfiguration: any
) {
  const newChartObject = _.clone(initialChartObject);
  const yAxisSeriesItems: any[] = ChartAxisUtil.getYAxisItems(
    analyticsObject,
    chartConfiguration.yAxisType
  );

  /**
   * Get pane attribute
   */
  newChartObject.pane = _.assign({}, getPaneOptions(chartConfiguration.type));

  /**
   * Get y axis options
   */
  newChartObject.yAxis = _.assign([], getYAxisOptions(chartConfiguration));

  /**
   * Sort the corresponding series
   */
  const sortedSeries = getSortableSeries(
    getChartSeries(
      analyticsObject,
      ChartAxisUtil.getXAxisItems(
        analyticsObject,
        chartConfiguration.xAxisType
      ),
      yAxisSeriesItems,
      chartConfiguration
    ),
    chartConfiguration.cumulativeValues ? -1 : chartConfiguration.sortOrder
  );

  /**
   * Rearange series based on some chart type
   */
  const rearrangedSeries = getRearrangedSeries(
    sortedSeries,
    chartConfiguration.type
  );

  /**
   * Get series
   */
  newChartObject.series = _.assign([], rearrangedSeries);

  /**
   * Get refined x axis options
   */
  newChartObject.xAxis = getXAxisOptions(
    getRefinedXAxisCategories(newChartObject.series),
    chartConfiguration
  );

  return newChartObject;
}

function extendPieChartOptions(
  initialChartObject: any,
  analyticsObject: any,
  chartConfiguration: any
) {
  const newChartObject = _.clone(initialChartObject);
  const yAxisSeriesItems: any[] = ChartAxisUtil.getYAxisItems(
    analyticsObject,
    chartConfiguration.yAxisType
  );

  /**
   * Sort the corresponding series
   */
  const sortedSeries = getSortableSeries(
    getChartSeries(
      analyticsObject,
      ChartAxisUtil.getXAxisItems(
        analyticsObject,
        chartConfiguration.xAxisType
      ),
      yAxisSeriesItems,
      chartConfiguration
    ),
    chartConfiguration.sortOrder
  );

  const sanitizedSeries = sortedSeries.map((series) => {
    series.data = series.data.map((dataObject: { y: number }) => {
      if (dataObject.y === null) {
        dataObject.y = 0;
      }
      return dataObject;
    });
    return series;
  });

  if (yAxisSeriesItems.length > 1) {
    /**
     * Get parent series for drill down
     * @type {{name: string; colorByPoint: boolean; data: any}[]}
     */
    newChartObject.series = getDrilldownParentSeries(
      sanitizedSeries,
      yAxisSeriesItems,
      chartConfiguration.yAxisType
    );

    /**
     * Get drill down series
     * @type {{series: any}}
     */
    newChartObject.drilldown = {
      series: sanitizedSeries,
    };
  } else {
    /**
     * Get series
     */
    newChartObject.series = _.assign([], sanitizedSeries);
  }

  return newChartObject;
}

function getDrilldownParentSeries(
  drilldownSeries: any[],
  yAxisItems: any[],
  parentType: string
) {
  // todo find readable names for parent types that are not data, period or organisation unit
  const seriesName =
    parentType === 'pe'
      ? 'Period'
      : parentType === 'dx'
      ? 'Data'
      : parentType === 'ou'
      ? 'Organisation unit'
      : 'Categories';

  const seriesData = _.map(
    yAxisItems,
    (yAxisObject: { name: any; id: string }) => {
      return {
        name: yAxisObject.name,
        drilldown: yAxisObject.id,
        y: deduceDrilldownParentDataFromChildrenSeries(
          drilldownSeries,
          yAxisObject.id
        ),
      };
    }
  );

  const newSeriesObject: any = {
    name: seriesName,
    colorByPoint: true,
    data: seriesData,
  };

  return [newSeriesObject];
}

function deduceDrilldownParentDataFromChildrenSeries(
  drilldownSeries: any[],
  parentId: string
): number {
  let parentData = 0;
  const correspondingSeriesObject = _.find(drilldownSeries, ['id', parentId]);

  if (correspondingSeriesObject) {
    parentData = _.reduce(
      _.map(correspondingSeriesObject.data, (data: { y: any }) => data.y),
      (sum: string, n: string | number) => {
        const newNumber = !isNaN(n as number) ? parseInt(n as string, 10) : 0;
        return parseInt(sum, 10) + newNumber;
      }
    );
  }
  return parentData;
}

function extendSolidGaugeChartOptions(
  initialChartObject: any,
  analyticsObject: any,
  chartConfiguration: any
) {
  // todo make gauge chart more understanble in analyisis
  const newChartObject = _.clone(initialChartObject);
  const yAxisSeriesItems: any[] = ChartAxisUtil.getYAxisItems(
    analyticsObject,
    chartConfiguration.yAxisType
  );

  /**
   * Get pane options
   */
  newChartObject.pane = getPaneOptions(chartConfiguration.type);

  /**
   * Get y axis options
   */
  newChartObject.yAxis = _.assign([], getYAxisOptions(chartConfiguration));

  /**
   * Sort the corresponding series
   */
  const sortedSeries = getSortableSeries(
    getChartSeries(
      analyticsObject,
      ChartAxisUtil.getXAxisItems(
        analyticsObject,
        chartConfiguration.xAxisType
      ),
      yAxisSeriesItems,
      chartConfiguration
    ),
    chartConfiguration.cumulativeValues ? -1 : chartConfiguration.sortOrder
  );

  return { ...newChartObject, series: sortedSeries };
}

function extendOtherChartOptions(
  initialChartObject: any,
  analyticsObject: any,
  chartConfiguration: any
): any {
  const series = new ChartSeries({
    analyticsObject,
    xAxisItems: ChartAxisUtil.getXAxisItems(
      analyticsObject,
      chartConfiguration.xAxisType
    ),
    yAxisItems: ChartAxisUtil.getYAxisItems(
      analyticsObject,
      chartConfiguration.yAxisType
    ),
    chartConfiguration,
  }).get();

  /**
   * Update colors by considering if series has data
   */
  const newColors: any[] = _.filter(
    _.map(series, (seriesObject: { data: { color: any }[] }) =>
      seriesObject.data[0] ? seriesObject.data[0].color : undefined
    ),
    (color: any) => color
  );

  return {
    ...initialChartObject,
    yAxis: getYAxisOptions(chartConfiguration),
    xAxis: getXAxisOptions(
      getRefinedXAxisCategories(series),
      chartConfiguration
    ),
    colors: newColors.length > 0 ? newColors : initialChartObject.colors,
    series,
  };
}

function getRearrangedSeries(series: any[], chartType: string) {
  return series;
}

function getRefinedXAxisCategories(series: any[]) {
  let newCategories: any[] = [];
  if (series) {
    const seriesDataObjects = _.map(
      series,
      (seriesObject: any) => seriesObject.data
    );

    if (seriesDataObjects) {
      const seriesCategoryNamesArray = _.map(
        seriesDataObjects,
        (seriesData: any) => {
          return _.map(seriesData, (data: { name: string }) => {
            const nameArray = data.name.split('_');
            let newCategoryArray: any[] = [];
            if (nameArray) {
              const reversedNameArray = _.reverse(nameArray);
              _.times(nameArray.length, (num: number) => {
                if (num === 0) {
                  newCategoryArray = [
                    ...newCategoryArray,
                    { name: reversedNameArray[num] },
                  ];
                } else {
                  const parentCategory: any = _.find(newCategoryArray, [
                    'name',
                    reversedNameArray[num - 1],
                  ]);

                  if (parentCategory) {
                    const parentCategoryIndex = _.findIndex(
                      newCategoryArray,
                      parentCategory
                    );
                    let newChildrenCategories: any[] = parentCategory.categories
                      ? parentCategory.categories
                      : [];
                    newChildrenCategories = _.concat(
                      newChildrenCategories,
                      reversedNameArray[num]
                    );
                    parentCategory.categories = _.assign(
                      [],
                      newChildrenCategories
                    );

                    newCategoryArray[parentCategoryIndex] = parentCategory;
                  }
                }
              });
            }
            return newCategoryArray[0];
          });
        }
      );
      if (seriesCategoryNamesArray) {
        const groupedCategoryNames = _.groupBy(
          seriesCategoryNamesArray[0],
          'name'
        );
        const categoryNameGroupKeys = _.map(
          seriesCategoryNamesArray[0],
          (category: { name: any }) => category.name
        );
        const sanitizedCategoryNames: any[] = [];
        _.forEach(categoryNameGroupKeys, (key: any) => {
          const categories = _.filter(
            _.map(groupedCategoryNames[key], (categoryObject: any) => {
              return categoryObject.categories
                ? categoryObject.categories[0]
                : null;
            }),
            (category: any) => category !== null
          );
          if (categories.length === 0) {
            sanitizedCategoryNames.push({ name: key });
          } else {
            sanitizedCategoryNames.push({
              name: key,
              categories: categories,
            });
          }
        });

        newCategories = _.assign([], sanitizedCategoryNames);
      }
    }
  }
  return _.uniqBy(newCategories, 'name');
}

function getSortableSeries(
  series: {
    name: any;
    id: any;
    index: number;
    turboThreshold: number;
    pointPlacement?: string;
    data: any[];
    type: string;
  }[],
  sortOrder: number
) {
  let newSeries = [...series];
  let seriesCategories: string | any[] = [];

  /**
   * Combine all available series for sorting
   */
  const combinedSeriesData = [
    ...getCombinedSeriesData(
      _.map(series, (seriesObject: { data: any }) => seriesObject.data)
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
    newSeries = _.map(series, (seriesObject: { data: any }) => {
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
  return newSeries;
}

function getCombinedSeriesData(seriesData: any) {
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

function getChartSeries(
  analyticsObject: any,
  xAxisItems: any[],
  yAxisItems: any[],
  chartConfiguration: any
) {
  const series = yAxisItems.map((yAxisItem, yAxisIndex) => {
    return {
      name: yAxisItem.name,
      id: yAxisItem.id,
      index: yAxisIndex,
      turboThreshold: 0,
      pointPlacement: chartConfiguration.type === 'radar' ? 'on' : undefined,
      data: getSeriesData(
        analyticsObject,
        chartConfiguration,
        yAxisItem.id,
        xAxisItems
      ),
      type: getAllowedChartType(chartConfiguration.type),
    };
  });

  return series;
}

function getSeriesData(
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
      const seriesValue = getSeriesValue(
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
        dataLabels: getDataLabelsOptions(chartConfiguration),
        y: seriesValue,
      });
    });
  }

  return data;
}

function getSeriesValue(
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

function getDataLabelsOptions(chartConfiguration: any) {
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

function getChartTitleObject(
  chartConfiguration: any,
  analyticsObject: any
): any {
  if (chartConfiguration.hideTitle) {
    return null;
  }

  const metaData = analyticsObject?.metaData || {};
  const subtitle = chartConfiguration.zAxisType
    .map((dimension: any) => {
      return (metaData[dimension] || [])
        .map((item: any) => (metaData?.names || {})[item])
        .join(',');
    })
    .filter((item: any) => item)
    .join(' - ');
  return {
    text: subtitle,
    align: 'center',
    style: {
      fontWeight: '400',
      fontSize: '11px',
    },
  };
}

function getChartSubtitleObject(
  chartConfiguration: any,
  analyticsObject: any
): any {
  if (chartConfiguration.hideSubtitle) {
    return null;
  }

  const metaData = analyticsObject?.metaData || {};
  const subtitle = chartConfiguration.zAxisType
    .map((dimension: any) => {
      return (metaData[dimension] || [])
        .map((item: any) => (metaData?.names || {})[item])
        .join(',');
    })
    .filter((item: any) => item)
    .join(' - ');

  return {
    text: subtitle,
    align: 'center',
    style: {
      fontWeight: '400',
      fontSize: '12px',
    },
  };
}

function getChartCreditsOptions(): any {
  return {
    enabled: false,
  };
}

function getChartColors(): any[] {
  return [
    '#A9BE3B',
    '#558CC0',
    '#D34957',
    '#FF9F3A',
    '#968F8F',
    '#B7409F',
    '#FFDA64',
    '#4FBDAE',
    '#B78040',
    '#676767',
    '#6A33CF',
    '#4A7833',
    '#434348',
    '#7CB5EC',
    '#F7A35C',
    '#F15C80',
  ];
}

function getChartExportingOptions(): any {
  return {
    buttons: {
      contextButton: {
        enabled: false,
      },
    },
  };
}

function getChartLabelOptions(chartConfiguration: any) {
  return {};
}

function getTooltipOptions(chartConfiguration: any) {
  const tooltipChartType = getAllowedChartType(chartConfiguration.type);
  let tooltipObject: any = {};

  if (tooltipChartType) {
    switch (tooltipChartType) {
      case 'solidgauge':
        tooltipObject = {
          enabled: false,
        };
        break;
      case 'pie':
        tooltipObject = {
          pointFormat:
            '{series.name}<br/> <b>{point.y}</b> ( {point.percentage:.1f} % )',
        };
        break;
      default:
        switch (chartConfiguration.type) {
          case 'stacked_column':
            tooltipObject = {
              headerFormat: '<b>{point.x}</b><br/>',
              pointFormat:
                '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
            };
            break;
          default:
            tooltipObject = {
              enabled: true,
            };
            break;
        }
        break;
    }
  }
  return tooltipObject;
}

function getPlotOptions(chartConfiguration: any) {
  const plotOptionChartType = getAllowedChartType(chartConfiguration.type);

  const plotOptions: any = {};
  if (plotOptionChartType) {
    switch (plotOptionChartType) {
      case 'solidgauge':
        plotOptions[plotOptionChartType] = {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true,
          },
        };
        break;
      case 'gauge':
        plotOptions[plotOptionChartType] = {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true,
          },
        };
        break;
      case 'pie':
        plotOptions[plotOptionChartType] = {
          borderWidth: 0,
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: !chartConfiguration.hideLegend,
        };
        break;
      default:
        plotOptions[
          plotOptionChartType !== '' ? plotOptionChartType : 'series'
        ] = {
          showInLegend: !chartConfiguration.hideLegend,
          colorByPoint: false,
          pointPadding: 0,
          groupPadding: chartConfiguration.noSpaceBetweenColumns ? 0 : 0.1,
        };

        /**
         * Set attributes for stacked charts
         */
        if (
          chartConfiguration.type === 'stacked_column' ||
          chartConfiguration.type === 'stacked_bar' ||
          chartConfiguration.type === 'area'
        ) {
          (plotOptions as any)[plotOptionChartType].stacking =
            chartConfiguration.percentStackedValues ? 'percent' : 'normal';
        }

        if (chartConfiguration.type === 'dotted') {
          (plotOptions as any)['line'] = {
            lineWidth: 0,
            states: {
              hover: {
                enabled: false,
              },
            },
          };
        }

        break;
    }
  }
  return plotOptions;
}

function getChartAttributeOptions(chartConfiguration: any) {
  const chartOptions: any = {
    renderTo: chartConfiguration.renderId,
    zoomType: 'xy',
    type: getAllowedChartType(chartConfiguration.type),
  };

  /**
   * Extend Options depending on chart type
   */
  if (chartConfiguration.type === 'pie') {
    chartOptions.plotBackgroundColor = null;
    chartOptions.plotBorderWidth = null;
    chartOptions.plotShadow = false;
  } else if (chartConfiguration.type === 'radar') {
    chartOptions.polar = true;
  }

  return chartOptions;
}

function getPaneOptions(chartType: string) {
  let paneOptions = {};

  switch (chartType) {
    case 'radar':
      paneOptions = _.assign(
        {},
        {
          size: '80%',
        }
      );
      break;
    default:
      paneOptions = _.assign(
        {},
        {
          center: ['50%', '85%'],
          size: '140%',
          startAngle: -90,
          endAngle: 90,
          background: {
            backgroundColor: '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc',
          },
        }
      );
      break;
  }
  return paneOptions;
}

function getLegendOptions(chartConfiguration: any) {
  return {
    align: chartConfiguration.legendAlign,
    reversed: chartConfiguration.reverseLegend,
    layout:
      chartConfiguration.legendAlign === 'right' ||
      chartConfiguration.legendAlign === 'left'
        ? 'vertical'
        : 'horizontal',
    y:
      chartConfiguration.legendAlign === 'top'
        ? 0
        : chartConfiguration.legendAlign === 'bottom'
        ? 25
        : 0,
  };
}

function getXAxisOptions(xAxisCategories: any[], chartConfiguration: any) {
  let xAxisOptions: any = {};

  const xAxisConfig: any = chartConfiguration.axes?.find(
    (axis: Record<string, unknown>) => axis['type'] === 'DOMAIN'
  );

  const allowDecimals = xAxisConfig?.decimals !== undefined;

  switch (chartConfiguration.type) {
    case 'radar':
      xAxisOptions = _.assign(
        {},
        {
          categories: xAxisCategories,
          tickmarkPlacement: 'on',
          lineWidth: 0,
        }
      );
      break;
    default:
      xAxisOptions = _.assign(
        {},
        {
          categories: xAxisCategories,
          allowDecimals,
          labels: {
            format: allowDecimals
              ? `{value:.${xAxisConfig.decimals ?? 1}f}`
              : undefined,
            y: 10,
            rotation: 90,
            useHTML: true,
            allowOverlap: true,
            style: {
              color: xAxisConfig?.label?.fontStyle?.textColor || '#000000',
              fontWeight: xAxisConfig?.label?.fontStyle?.bold
                ? 'bold'
                : 'normal',
              fontSize: xAxisConfig?.label?.fontStyle?.fontSize || '11px',
              wordBreak: 'break-all',
              textAlign: 'center',
              textOverflow: 'allow',
            },
          },
          title: {
            text: xAxisConfig?.title?.text,
            margin: 16,
            align: ChartAxisUtil.sanitizeYAxisTextAlignment(
              xAxisConfig?.title?.fontStyle?.textAlign
            ),
            style: {
              color: xAxisConfig?.title?.fontStyle?.textColor || '#000000',
              fontWeight: xAxisConfig?.title?.fontStyle?.bold
                ? 'bold'
                : 'normal',
              fontStyle: xAxisConfig?.title?.fontStyle?.italic
                ? 'italic'
                : 'normal',
              fontSize: xAxisConfig?.title?.fontStyle?.fontSize || '13px',
            },
          },
        }
      );
      break;
  }

  if (
    _.has(xAxisOptions, 'categories') &&
    xAxisOptions.categories.length > 10 &&
    xAxisOptions.categories[0]?.name?.length > 5
  ) {
    return {
      ...xAxisOptions,
      labels: {
        ...xAxisOptions,
        rotation: -45,
      },
    };
  } else if (
    _.has(xAxisOptions, 'categories') &&
    xAxisOptions.categories.length > 10 &&
    xAxisOptions.categories[0]?.name?.length <= 5
  ) {
    return {
      ...xAxisOptions,
      labels: {
        ...xAxisOptions,
        rotation: 0,
      },
    };
  } else if (
    _.has(xAxisOptions, 'categories') &&
    xAxisOptions.categories.length <= 10 &&
    xAxisOptions.categories[0]?.name?.length <= 5
  ) {
    return {
      ...xAxisOptions,
      labels: {
        ...xAxisOptions,
        rotation: 0,
      },
    };
  } else if (
    _.has(xAxisOptions, 'categories') &&
    xAxisOptions.categories.length <= 10 &&
    xAxisOptions.categories[0]?.name?.length > 5
  ) {
    return {
      ...xAxisOptions,
      labels: {
        ...xAxisOptions,
        rotation: 0,
      },
    };
  } else {
    return xAxisOptions;
  }
}

function getYAxisOptions(chartConfiguration: any) {
  const yAxes: any[] = chartConfiguration.axes?.filter(
    (axis: Record<string, unknown>) => axis['type'] === 'RANGE'
  );
  let newYAxes: any[] = [];

  if (yAxes.length === 0) {
    newYAxes = _.assign(
      [],
      [
        {
          reversedStacks: false,
          min: chartConfiguration.rangeAxisMinValue,
          max: chartConfiguration.rangeAxisMaxValue,
          title: {
            text: '',
            style: {
              color: '#000000',
              fontWeight: 'normal',
              fontSize: '13px',
            },
          },
        },
      ]
    );
  } else {
    newYAxes = _.map(yAxes, (yAxis: any, yAxisIndex: any) => {
      const allowDecimals = yAxis.decimals !== undefined;
      return {
        reversedStacks: false,
        min: chartConfiguration.rangeAxisMinValue,
        max: chartConfiguration.rangeAxisMaxValue,
        allowDecimals,
        labels: {
          format: allowDecimals
            ? `{value:.${yAxis.decimals ?? 1}f}`
            : undefined,
          style: {
            color: yAxis?.label?.fontStyle?.textColor || '#000000',
            fontWeight: yAxis?.label?.fontStyle?.bold ? 'bold' : 'normal',
            fontSize: yAxis?.label?.fontStyle?.fontSize || '11px',
          },
        },
        title: {
          text: yAxis?.title?.text,
          margin: 16,
          align: ChartAxisUtil.sanitizeYAxisTextAlignment(
            yAxis?.title?.fontStyle?.textAlign
          ),
          style: {
            color: yAxis?.title?.fontStyle?.textColor || '#000000',
            fontWeight: yAxis?.title?.fontStyle?.bold ? 'bold' : 'normal',
            fontStyle: yAxis?.title?.fontStyle?.italic ? 'italic' : 'normal',
            fontSize: yAxis?.title?.fontStyle?.fontSize || '13px',
          },
        },
      };
    });
  }

  return _.map(newYAxes, (yAxis: any) => {
    /**
     * Get more options depending on chart type
     */
    switch (chartConfiguration.type) {
      case 'radar':
        yAxis['gridLineInterpolation'] = 'polygon';
        yAxis['lineWidth'] = 0;
        break;
      case 'solidgauge':
        yAxis['lineWidth'] = 0;
        yAxis['labels'] = {
          y: 16,
        };
        yAxis['max'] = 100;
        break;
      case 'stacked_column':
        yAxis['stackLabels'] = {
          enabled: false,
          style: {
            fontWeight: 'bold',
          },
        };
        break;
      default:
        yAxis['plotLines'] = [
          {
            color: '#000000',
            dashStyle: 'Solid',
            value: chartConfiguration.targetLineValue,
            width: 2,
            zIndex: 1000,
            label: {
              text: chartConfiguration.targetLineLabel,
            },
          },
          {
            color: '#000000',
            dashStyle: 'Solid',
            value: chartConfiguration.baseLineValue,
            zIndex: 1000,
            width: 2,
            label: {
              text: chartConfiguration.baseLineLabel,
            },
          },
        ];
        break;
    }
    return yAxis;
  });
}

function getAllowedChartType(chartType: string): string {
  let newChartType = '';
  const splitedChartType: string[] = chartType.split('_');
  switch (chartType) {
    case 'radar':
      newChartType = 'line';
      break;
    case 'dotted':
      newChartType = 'line';
      break;
    default:
      newChartType =
        splitedChartType.length > 1 ? splitedChartType[1] : splitedChartType[0];
      break;
  }
  return newChartType;
}

function sanitizeAnalyticsBasedOnConfiguration(
  analyticsObject: any,
  chartConfiguration: any
) {
  let newAnalyticsObject = _.clone(analyticsObject);

  if (chartConfiguration.cumulativeValues) {
    newAnalyticsObject = _.assign(
      {},
      mapAnalyticsToCumulativeFormat(
        analyticsObject,
        chartConfiguration.xAxisType[0],
        chartConfiguration.yAxisType
      )
    );
  }

  return newAnalyticsObject;
}

function mapAnalyticsToCumulativeFormat(
  analyticsObject: any,
  xAxisType: any,
  yAxisType: any
) {
  const newAnalyticsObject = _.clone(analyticsObject);

  if (analyticsObject) {
    const yAxisDimensionArray = analyticsObject.metaData[yAxisType];
    const xAxisDimensionArray = [
      ..._.reverse([...analyticsObject.metaData[xAxisType]]),
    ];
    const yAxisDimensionIndex = _.findIndex(
      analyticsObject.headers,
      _.find(analyticsObject.headers, ['name', yAxisType])
    );
    const xAxisDimensionIndex = _.findIndex(
      analyticsObject.headers,
      _.find(analyticsObject.headers, ['name', xAxisType])
    );
    const dataValueIndex = _.findIndex(
      analyticsObject.headers,
      _.find(analyticsObject.headers, ['name', 'value'])
    );
    const newRows: any[] = [];
    yAxisDimensionArray.forEach((yAxisDimensionValue: any) => {
      let initialValue = 0;
      xAxisDimensionArray.forEach((xAxisDimensionValue) => {
        analyticsObject.rows.forEach((row: string[]) => {
          if (
            row[yAxisDimensionIndex] === yAxisDimensionValue &&
            row[xAxisDimensionIndex] === xAxisDimensionValue
          ) {
            initialValue += parseInt(row[dataValueIndex], 10);
            const newRow = _.clone(row);
            (newRow as any)[dataValueIndex] = initialValue;
            newRows.push(newRow);
          }
        });
      });
    });
    newAnalyticsObject.rows = _.assign([], newRows);
  }
  return newAnalyticsObject;
}

function getSanitizedChartObject(chartObject: any, chartConfiguration: any) {
  const dataSelectionGroups = _.flatten(
    _.filter(
      _.map(chartConfiguration.dataSelections || [], (dataSelection: any) => {
        return dataSelection.groups;
      }),
      (group: any) => group
    )
  );

  const dataSelectionGroupMembers = _.flatten(
    _.map(dataSelectionGroups, (group: { members: any; id: any }) => {
      return _.map(group.members, (member: any) => `${member.id}_${group.id}`);
    })
  );

  // Remove non numeric series data and their categories
  const dataIndexesArrayToRemove = _.map(
    chartObject.series,
    (seriesObject: { data: any }) => {
      return _.filter(
        _.map(seriesObject.data, (dataItem: any, dataIndex: number) =>
          dataItem.y === '' ||
          (dataSelectionGroupMembers.length > 0 &&
            dataSelectionGroupMembers.indexOf(dataItem.id) === -1)
            ? dataIndex
            : -1
        ),
        (dataIndex: number) => dataIndex !== -1
      );
    }
  );

  let newDataIndexes: any[] = [];
  _.each(dataIndexesArrayToRemove, (dataIndexes: number[]) => {
    newDataIndexes = newDataIndexes.length === 0 ? dataIndexes : newDataIndexes;
    newDataIndexes = _.intersection(newDataIndexes, dataIndexes);
  });

  const newSeries = _.map(chartObject.series, (seriesObject: any) => {
    return {
      ...seriesObject,
      data: _.filter(
        _.map(seriesObject.data, (dataItem: any) => {
          const splitedDataItemId = (
            dataItem.id ||
            dataItem.drilldown ||
            ''
          ).split('_');

          const associatedGroup = _.find(dataSelectionGroups, [
            'id',
            splitedDataItemId[1],
          ]);

          return associatedGroup &&
            _.some(
              associatedGroup.members,
              (member: any) => member.id === splitedDataItemId[0]
            ) &&
            associatedGroup.color
            ? { ...dataItem, color: associatedGroup.color }
            : dataItem;
        }),
        (dataItem: any, dataIndex: number) =>
          newDataIndexes.indexOf(dataIndex) === -1
      ),
    };
  });

  let categoryCount = 0;
  const newCategories = _.map(
    chartObject.xAxis ? chartObject.xAxis.categories : [],
    (category: any) => {
      if (!category.categories) {
        return category;
      }
      const newCategory = {
        ...category,
        categories: _.filter(
          category.categories,
          (innerCategory: any, innerCategoryIndex: number) =>
            newDataIndexes.indexOf(innerCategoryIndex + categoryCount) === -1
        ),
      };

      categoryCount += category.categories ? category.categories.length : 0;
      return newCategory;
    }
  );

  return {
    ...chartObject,
    series: newSeries,
    xAxis: { ...chartObject.xAxis, categories: newCategories },
  };
}
