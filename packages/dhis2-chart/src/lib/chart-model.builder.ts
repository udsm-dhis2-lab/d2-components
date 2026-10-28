import * as _ from 'lodash';
import {
  ChartAxisModel,
  ChartModel,
  ChartPointModel,
  ChartSeriesKind,
  ChartSeriesModel,
  requiredChartModules,
} from './chart-model';

const SERIES_KINDS: readonly ChartSeriesKind[] = [
  'line',
  'column',
  'bar',
  'area',
  'pie',
  'solidgauge',
  'gauge',
];

function seriesKind(
  value: unknown,
  fallback: ChartSeriesKind
): ChartSeriesKind {
  return typeof value === 'string' &&
    SERIES_KINDS.includes(value as ChartSeriesKind)
    ? (value as ChartSeriesKind)
    : fallback;
}

function toPoint(point: any): ChartPointModel {
  return {
    ...(point.id !== undefined ? { id: point.id } : {}),
    ...(point.name !== undefined ? { name: point.name } : {}),
    value: point.y,
    ...(point.color !== undefined ? { color: point.color } : {}),
    ...(point.drilldown !== undefined ? { drilldown: point.drilldown } : {}),
    ...(point.dataLabels !== undefined
      ? { label: _.cloneDeep(point.dataLabels) }
      : {}),
  };
}

function toSeries(series: any, fallback: ChartSeriesKind): ChartSeriesModel {
  return {
    kind: seriesKind(series.type, fallback),
    ...(series.id !== undefined ? { id: series.id } : {}),
    ...(series.name !== undefined ? { name: series.name } : {}),
    ...(series.index !== undefined ? { index: series.index } : {}),
    ...(series.turboThreshold !== undefined
      ? { turboThreshold: series.turboThreshold }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(series, 'pointPlacement')
      ? { pointPlacement: series.pointPlacement }
      : {}),
    ...(series.yAxis !== undefined ? { axisIndex: series.yAxis } : {}),
    ...(series.lineWidth !== undefined ? { lineWidth: series.lineWidth } : {}),
    ...(series.states !== undefined
      ? { states: _.cloneDeep(series.states) }
      : {}),
    ...(series.colorByPoint !== undefined
      ? { colorByPoint: series.colorByPoint }
      : {}),
    points: (series.data || []).map(toPoint),
  } as ChartSeriesModel;
}

function toAxis(axis: any): ChartAxisModel {
  return {
    ...(axis.categories !== undefined
      ? { categories: _.cloneDeep(axis.categories) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(axis, 'min')
      ? { minimum: axis.min }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(axis, 'max')
      ? { maximum: axis.max }
      : {}),
    ...(axis.allowDecimals !== undefined
      ? { decimalsAllowed: axis.allowDecimals }
      : {}),
    ...(axis.labels !== undefined ? { labels: _.cloneDeep(axis.labels) } : {}),
    ...(axis.title !== undefined ? { title: _.cloneDeep(axis.title) } : {}),
    ...(axis.plotLines !== undefined
      ? { referenceLines: _.cloneDeep(axis.plotLines) }
      : {}),
    ...(axis.stackLabels !== undefined
      ? { stackTotals: _.cloneDeep(axis.stackLabels) }
      : {}),
    ...(axis.reversedStacks !== undefined
      ? { reversedStacks: axis.reversedStacks }
      : {}),
    ...(axis.tickmarkPlacement !== undefined
      ? { tickPlacement: axis.tickmarkPlacement }
      : {}),
    ...(axis.lineWidth !== undefined ? { lineWidth: axis.lineWidth } : {}),
    ...(axis.gridLineInterpolation !== undefined
      ? { gridInterpolation: axis.gridLineInterpolation }
      : {}),
  };
}

/** Compatibility bridge: turn the legacy helper's plain intermediate into chart meaning. */
export function toChartModel(
  intermediate: any,
  visualType: string
): ChartModel {
  const chartType = intermediate.chart?.type || visualType;
  const fallback = seriesKind(chartType, 'line');
  const drilldownSeries = intermediate.drilldown?.series?.map((item: any) =>
    toSeries(item, fallback)
  );
  const axes: any[] | undefined = intermediate.yAxis;
  return {
    kind: 'CHART_MODEL',
    visualType,
    chartType,
    seriesKind: fallback,
    renderTarget: intermediate.chart?.renderTo,
    zoomMode: intermediate.chart?.zoomType,
    ...(intermediate.chart?.polar !== undefined
      ? { polar: intermediate.chart.polar }
      : {}),
    ...(intermediate.chart?.plotBackgroundColor !== undefined
      ? { backgroundColor: intermediate.chart.plotBackgroundColor }
      : {}),
    ...(intermediate.chart?.plotBorderWidth !== undefined
      ? { borderWidth: intermediate.chart.plotBorderWidth }
      : {}),
    ...(intermediate.chart?.plotShadow !== undefined
      ? { shadow: intermediate.chart.plotShadow }
      : {}),
    title: _.cloneDeep(intermediate.title),
    subtitle: intermediate.subtitle,
    palette: [...intermediate.colors],
    ...(intermediate.xAxis !== undefined
      ? { categoryAxis: toAxis(intermediate.xAxis) }
      : {}),
    ...(axes !== undefined ? { valueAxes: axes.map(toAxis) } : {}),
    ...(intermediate.pane !== undefined
      ? { pane: _.cloneDeep(intermediate.pane) }
      : {}),
    series: (intermediate.series || []).map((item: any) =>
      toSeries(item, fallback)
    ),
    ...(drilldownSeries !== undefined ? { drilldownSeries } : {}),
    seriesPresentation: _.cloneDeep(intermediate.plotOptions),
    tooltip: _.cloneDeep(intermediate.tooltip),
    ...(intermediate.legend !== undefined
      ? { legend: _.cloneDeep(intermediate.legend) }
      : {}),
    credits: _.cloneDeep(intermediate.credits),
    exporting: _.cloneDeep(intermediate.exporting),
    annotations: (axes || []).flatMap((axis, axisIndex) =>
      (axis.plotLines || []).map((line: any) => ({
        kind: 'reference-line' as const,
        axisIndex,
        value: line.value,
        label: line.label?.text,
      }))
    ),
    requiredModules: requiredChartModules(
      visualType,
      !!drilldownSeries?.length
    ),
  };
}
