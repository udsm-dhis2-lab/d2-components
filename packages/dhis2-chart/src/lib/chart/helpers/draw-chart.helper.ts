import * as _ from 'lodash';
import { ChartAxisUtil } from '../utils';
import { ChartColor } from '../models';
import { ChartModel } from '../../chart-model';
import { toChartModel } from '../../chart-model.builder';
import {
  accumulateAnalytics,
  applySeriesOptions,
  buildSeriesMatrix,
  filterEmptySeriesPoints,
  hideEmptyCategories,
  refineCategories,
  resolveLayout,
  resolveSeriesColors,
  sortSeries,
  sortSeriesByCategory,
} from '../transforms/analytical.transforms';
import {
  buildReferenceLines,
  buildTitleOptions,
  buildTooltipOptions,
  formatAxisNumber,
  resolveStacking,
} from '../transforms/presentation.transforms';

export type ChartFamily = 'cartesian' | 'circular' | 'polar' | 'gauge' | 'combined';

function modern(config: any, key: string): any {
  return config.config?.[key] ?? config[key];
}

function style(styled: any): Record<string, unknown> {
  const font = styled?.fontStyle || {};
  return {
    ...(font.textColor ? { color: font.textColor } : {}),
    ...(font.fontSize ? { fontSize: `${font.fontSize}px` } : {}),
    ...(font.bold !== undefined ? { fontWeight: font.bold ? 'bold' : 'normal' } : {}),
    ...(font.italic !== undefined ? { fontStyle: font.italic ? 'italic' : 'normal' } : {}),
  };
}

function fontSize(value: unknown, fallback: string): string {
  return typeof value === 'number' ? `${value}px` : typeof value === 'string' && value ? value : fallback;
}

function applyModernPresentation(chart: any, config: any): any {
  const raw = { ...config, ...(config.config || {}) };
  const modernTitle = !config.config || Object.prototype.hasOwnProperty.call(config.config, 'title');
  if (modernTitle && typeof raw.title === 'string' && !config.hideTitle) chart.title = {
    ...chart.title, text: raw.title,
    style: { ...chart.title?.style, ...style(raw.fontStyle?.visualizationTitle) },
  };
  if (raw.hideTitle) chart.title = { ...chart.title, text: null };
  if (typeof raw.subtitle === 'string') chart.subtitle = raw.hideSubtitle ? '' :
    raw.fontStyle?.visualizationSubtitle ? { text: raw.subtitle, style: style(raw.fontStyle.visualizationSubtitle) } : raw.subtitle;
  if (raw.seriesKey && typeof raw.seriesKey === 'object') chart.legend = {
    enabled: !raw.seriesKey.hidden,
    itemStyle: style(raw.seriesKey.label),
  };
  return chart;
}

/** Legacy entry point; definitions supply the family explicitly. */
export function drawChart(
  analyticsResult: any,
  chartConfiguration: any
): ChartModel {
  const families: Record<string, ChartFamily> = {
    radar: 'polar', solidgauge: 'gauge', gauge: 'gauge',
    pie: 'circular', combined: 'combined',
  };
  return drawChartFamily(analyticsResult, chartConfiguration, families[chartConfiguration.type] || 'cartesian');
}

export function drawChartFamily(
  analyticsResult: any,
  chartConfiguration: any,
  family: ChartFamily
): ChartModel {
  const analyticsObject = chartConfiguration.cumulativeValues
    ? accumulateAnalytics(
        analyticsResult,
        chartConfiguration.xAxisType[0],
        Array.isArray(chartConfiguration.yAxisType) ? chartConfiguration.yAxisType[0] : chartConfiguration.yAxisType
      )
    : analyticsResult;

  let chartObject: any = {
    chart: getChartAttributeOptions(chartConfiguration),
    title: buildTitleOptions(chartConfiguration, analyticsResult.metaData),
    subtitle: '',
    credits: getChartCreditsOptions(),
    colors: new ChartColor().colors,
    plotOptions: getPlotOptions(chartConfiguration),
    tooltip: buildTooltipOptions(
      chartConfiguration,
      getAllowedChartType(chartConfiguration.type)
    ),
    exporting: getChartExportingOptions(),
    // legend: getLegendOptions(chartConfiguration)
  };

  /**
   * Extend chart options depending on type
   */

  const builders: Record<ChartFamily, () => any> = {
    cartesian: () => extendOtherChartOptions(chartObject, analyticsObject, chartConfiguration),
    circular: () => extendPieChartOptions(chartObject, analyticsObject, chartConfiguration),
    polar: () => extendSpiderWebChartOptions(chartObject, analyticsObject, chartConfiguration),
    gauge: () => extendSolidGaugeChartOptions(chartObject, analyticsObject,
      chartConfiguration.type === 'gauge' ? { ...chartConfiguration, type: 'solidgauge' } : chartConfiguration),
    combined: () => chartObject,
  };
  chartObject = applyModernPresentation(builders[family](), chartConfiguration);

  return toChartModel(
    filterEmptySeriesPoints(chartObject, chartConfiguration),
    chartConfiguration.type
  );
}

function extendSpiderWebChartOptions(
  initialChartObject: any,
  analyticsObject: any,
  chartConfiguration: any
) {
  const newChartObject = _.clone(initialChartObject);
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
  const sortedSeries = sortSeries(
    buildSeriesMatrix(
      analyticsObject,
      resolveLayout(analyticsObject, chartConfiguration),
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
    refineCategories(newChartObject.series),
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
  const sortedSeries = sortSeries(
    buildSeriesMatrix(
      analyticsObject,
      resolveLayout(analyticsObject, chartConfiguration),
      chartConfiguration
    ),
    chartConfiguration.sortOrder
  );

  const sanitizedSeries = sortedSeries.map((series) => {
    series.data = series.data.map((dataObject: { y: number }) => {
      if (dataObject.y === null && chartConfiguration.__pieNullAsZero !== false) {
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
  const sortedSeries = sortSeries(
    buildSeriesMatrix(
      analyticsObject,
      resolveLayout(analyticsObject, chartConfiguration),
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
  const layout = resolveLayout(analyticsObject, chartConfiguration);
  const structuredSort = modern(chartConfiguration, 'sorting');
  const sorted = sortSeries(
      buildSeriesMatrix(analyticsObject, layout, chartConfiguration),
      chartConfiguration.cumulativeValues ? -1 : chartConfiguration.sortOrder
    );
  const ordered = structuredSort?.length
    ? sortSeriesByCategory(sorted, structuredSort[0].direction) : sorted;
  const strategy = modern(chartConfiguration, 'hideEmptyRowItems');
  const categoryIndexes = chartConfiguration.xAxisType.map((dimension: string) =>
    analyticsObject.headers.findIndex((header: any) => header.name === dimension));
  const presentCategoryIds = new Set<string>(analyticsObject.rows.map((row: any[]) =>
    categoryIndexes.map((index: number) => row[index]).join('_')));
  const visible = strategy && strategy !== 'NONE'
    ? hideEmptyCategories(ordered, strategy, presentCategoryIds) : ordered;
  const nativeSeries = modern(chartConfiguration, 'series');
  const rangeAxes = (chartConfiguration.axes || []).filter((axis: any) => axis.type === 'RANGE')
    .sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0));
  const options = Array.isArray(nativeSeries) && nativeSeries.length
    ? nativeSeries.map((item: any) => ({
      dimensionItem: item.dimensionItem,
      axis: item.axis === undefined ? undefined : rangeAxes.length
        ? rangeAxes.findIndex((axis: any) => (axis.index ?? 0) === item.axis)
        : item.axis,
      type: item.type?.toLowerCase() || chartConfiguration.type,
    }))
    : chartConfiguration.seriesOptions;
  const series = applySeriesOptions(visible, options);

  /**
   * Update colors by considering if series has data
   */
  return {
    ...initialChartObject,
    yAxis: getYAxisOptions(chartConfiguration),
    xAxis: getXAxisOptions(refineCategories(series), chartConfiguration),
    colors: resolveSeriesColors(series, initialChartObject.colors),
    series,
  };
}

function getRearrangedSeries(series: any[], chartType: string) {
  return series;
}

function getChartCreditsOptions(): any {
  return {
    enabled: false,
  };
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
      default: {
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
        const stacking = chartConfiguration.__resolvedStacking ?? resolveStacking(chartConfiguration);
        if (stacking)
          (plotOptions as any)[plotOptionChartType].stacking = stacking;

        if (chartConfiguration.__dottedLine || chartConfiguration.type === 'dotted') {
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
          ...(xAxisConfig?.steps !== undefined ? { tickInterval: xAxisConfig.steps } : {}),
          labels: {
            format: formatAxisNumber(xAxisConfig?.decimals),
            y: 10,
            rotation: 90,
            useHTML: true,
            allowOverlap: true,
            style: {
              color: xAxisConfig?.label?.fontStyle?.textColor || '#000000',
              fontWeight: xAxisConfig?.label?.fontStyle?.bold
                ? 'bold'
                : 'normal',
              fontSize: fontSize(xAxisConfig?.label?.fontStyle?.fontSize, '11px'),
              wordBreak: 'break-all',
              textAlign: 'center',
              textOverflow: 'allow',
            },
          },
          title: {
            text: xAxisConfig?.title?.textMode === 'AUTO' ? undefined : xAxisConfig?.title?.text,
            margin: 16,
            align: ChartAxisUtil.formatAxisTextAlignment(
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
              fontSize: fontSize(xAxisConfig?.title?.fontStyle?.fontSize, '13px'),
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
  ).sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0)) || [];
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
        min: yAxis.minValue ?? chartConfiguration.rangeAxisMinValue,
        max: yAxis.maxValue ?? chartConfiguration.rangeAxisMaxValue,
        ...(yAxis.steps !== undefined ? { tickAmount: yAxis.steps + 1 } : {}),
        allowDecimals,
        labels: {
          format: formatAxisNumber(yAxis.decimals),
          style: {
            color: yAxis?.label?.fontStyle?.textColor || '#000000',
            fontWeight: yAxis?.label?.fontStyle?.bold ? 'bold' : 'normal',
            fontSize: fontSize(yAxis?.label?.fontStyle?.fontSize, '11px'),
          },
        },
        title: {
          text: yAxis?.title?.textMode === 'AUTO' ? undefined : yAxis?.title?.text,
          margin: 16,
          align: ChartAxisUtil.formatAxisTextAlignment(
            yAxis?.title?.fontStyle?.textAlign
          ),
          style: {
            color: yAxis?.title?.fontStyle?.textColor || '#000000',
            fontWeight: yAxis?.title?.fontStyle?.bold ? 'bold' : 'normal',
            fontStyle: yAxis?.title?.fontStyle?.italic ? 'italic' : 'normal',
            fontSize: fontSize(yAxis?.title?.fontStyle?.fontSize, '13px'),
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
        yAxis['plotLines'] = buildReferenceLines(chartConfiguration);
        {
          const axisConfig = yAxes[newYAxes.indexOf(yAxis)] || {};
          const lines = ['baseLine', 'targetLine'].map(key => axisConfig[key]).filter(Boolean);
          if (lines.length) yAxis['plotLines'] = lines.map((line: any) => ({
            color: '#000000', dashStyle: 'Solid', value: line.value,
            width: 2, zIndex: 1000,
            label: { text: line.title?.text, style: style(line.title) },
          }));
        }
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
