import * as _ from 'lodash';
import { ChartAxisUtil, ChartTypeUtil } from '../utils';
import { ChartSeriesObject } from '../models';
import { ChartSeriesData } from '../models/chart-series-data.model';
import { buildDataLabelOptions } from './presentation.transforms';

export interface CategoryTuple {
  readonly id: string;
  readonly name: string;
  readonly labels?: readonly string[];
}

export interface DisplayCategoryTuple {
  readonly leaf: string;
  readonly parent?: string;
  readonly name: string;
}

export interface ChartLayout {
  readonly xAxisItems: readonly CategoryTuple[];
  readonly yAxisItems: readonly CategoryTuple[];
}

export interface SeriesLayoutConfiguration {
  readonly type: string;
  readonly xAxisType: readonly string[];
  readonly yAxisType: string;
  readonly showData?: boolean;
}

export interface SeriesOption {
  readonly dimensionItem: string;
  readonly type: string;
  readonly axis?: number;
  readonly axix?: number; // Historical spelling retained for compatibility.
  readonly color?: string;
}

export interface SelectionGroup {
  readonly id: string;
  readonly color?: string;
  readonly members: readonly { readonly id: string }[];
}

export interface SelectionConfiguration {
  readonly dataSelections?: readonly { readonly groups?: readonly SelectionGroup[] }[];
}

// Keep the legacy axis resolver's ordering until a separately approved behavior change.
export function resolveLayout(analytics: any, configuration: Pick<SeriesLayoutConfiguration, 'xAxisType' | 'yAxisType'>): ChartLayout {
  return {
    xAxisItems: buildCategoryTuples(
      ChartAxisUtil.getXAxisItems(analytics, [...configuration.xAxisType])
    ),
    yAxisItems: buildCategoryTuples(
      ChartAxisUtil.getYAxisItems(analytics, configuration.yAxisType)
    ),
  };
}

export function buildCategoryTuples(
  items: readonly CategoryTuple[]
): CategoryTuple[] {
  return items.map(({ id, name, labels }) => ({ id, name, ...(labels ? { labels: [...labels] } : {}) }));
}

export function buildSeriesMatrix(
  analytics: any,
  layout: ChartLayout,
  configuration: SeriesLayoutConfiguration
): ChartSeriesObject[] {
  return layout.yAxisItems.map((item, index) => ({
    name: item.name,
    id: item.id,
    index,
    turboThreshold: 0,
    pointPlacement: configuration.type === 'radar' ? 'on' : undefined,
    data: ChartSeriesData.get(analytics, configuration, item.id, [
      ...layout.xAxisItems,
    ]).map((point) => ({
      ...point,
      dataLabels: buildDataLabelOptions(configuration),
    })),
    type: ChartTypeUtil.getAllowedType(configuration.type) as string,
  }));
}

export function combineSeriesData(
  seriesData: readonly (readonly any[])[]
): any[] {
  let combined: any[] = [];
  seriesData.forEach((points) => {
    points.forEach((point) => {
      const available = _.find(combined, ['id', point.id]);
      if (!available) {
        combined = [...combined, _.cloneDeep(point)];
      } else {
        const index = _.findIndex(combined, available);
        const next = { ..._.cloneDeep(point), y: point.y + available.y };
        combined = [
          ...combined.slice(0, index),
          next,
          ...combined.slice(index + 1),
        ];
      }
    });
  });
  return combined;
}

export function sortSeries<T extends { data: any[] }>(
  series: readonly T[],
  sortOrder: number
): T[] {
  const combined = combineSeriesData(series.map((item) => item.data));
  if (sortOrder !== 1 && sortOrder !== -1)
    return _.cloneDeep(series) as T[];
  const ordered = _.sortBy(combined, ['y']);
  const ids = (sortOrder === 1 ? [...ordered].reverse() : ordered).map(
    (point) => point.id
  );
  return _.cloneDeep(series.map((item) => ({
    ...item,
    data:
      ids.length > 0
        ? ids.map((id) => _.find(item.data, ['id', id]))
        : [...item.data],
  }))) as T[];
}

export function sortSeriesByCategory<T extends { data: any[] }>(
  series: readonly T[], direction: 'ASC' | 'DESC'
): T[] {
  const ids = (series[0]?.data || []).map(point => ({ id: point.id, name: String(point.name ?? '') }));
  ids.sort((a, b) => direction === 'ASC' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  return _.cloneDeep(series.map(item => ({
    ...item, data: ids.map(category => item.data.find(point => point.id === category.id)).filter(Boolean),
  }))) as T[];
}

export type EmptyItemStrategy = 'NONE' | 'BEFORE_FIRST' | 'AFTER_LAST' | 'BEFORE_FIRST_AFTER_LAST' | 'ALL';
export function hideEmptyCategories<T extends { data: any[] }>(
  series: readonly T[], strategy: EmptyItemStrategy,
  presentCategoryIds?: ReadonlySet<string>
): T[] {
  if (strategy === 'NONE' || !series.length) return _.cloneDeep(series) as T[];
  const count = series[0].data.length;
  const populated = (index: number) => presentCategoryIds
    ? presentCategoryIds.has(String(series[0].data[index]?.id)) : series.some(item => {
    const value = item.data[index]?.y;
    return value !== null && value !== undefined && value !== '';
  });
  const first = Array.from({ length: count }, (_, index) => index).find(populated) ?? count;
  const last = Array.from({ length: count }, (_, index) => index).reverse().find(populated) ?? -1;
  const keep = (index: number) => strategy === 'ALL' ? populated(index)
    : strategy === 'BEFORE_FIRST' ? index >= first
    : strategy === 'AFTER_LAST' ? index <= last : index >= first && index <= last;
  return _.cloneDeep(series.map(item => ({ ...item, data: item.data.filter((_point, index) => keep(index)) }))) as T[];
}

export function applySeriesOptions<
  T extends { id: string; type: string; data: any[] }
>(series: readonly T[], options: readonly SeriesOption[] | undefined): T[] {
  return _.cloneDeep(series.map((item) => {
    const extended = options?.find(
      (option) => option.dimensionItem === item.id
    );
    if (!extended) return { ...item, data: [...item.data] };
    const color =
      extended.color && extended.color.length > 0 ? extended.color : undefined;
    const dotted = extended.type === 'dotted';
    return {
      ...item,
      ...(dotted
        ? { lineWidth: 0, states: { hover: { enabled: false } } }
        : {}),
      yAxis: extended.axis ?? extended.axix ?? 0,
      type: ChartTypeUtil.getAllowedType(extended.type) || item.type,
      data: color
        ? item.data.map((point) => ({ ...point, color }))
        : [...item.data],
    };
  })) as T[];
}

export function accumulateAnalytics(
  analytics: any,
  xAxisType: string,
  yAxisType: string
): any {
  if (!analytics) return analytics;
  const yItems = analytics.metaData[yAxisType];
  const xItems = [...analytics.metaData[xAxisType]].reverse();
  const yIndex = analytics.headers.findIndex(
    (header: any) => header.name === yAxisType
  );
  const xIndex = analytics.headers.findIndex(
    (header: any) => header.name === xAxisType
  );
  const valueIndex = analytics.headers.findIndex(
    (header: any) => header.name === 'value'
  );
  const rows: any[] = [];
  yItems.forEach((yId: string) => {
    let running = 0;
    xItems.forEach((xId: string) => {
      analytics.rows.forEach((row: any[]) => {
        if (row[yIndex] === yId && row[xIndex] === xId) {
          const value = Number(row[valueIndex]);
          if (Number.isFinite(value)) running += value;
          const next = [...row];
          next[valueIndex] = running;
          rows.push(next);
        }
      });
    });
  });
  return { ..._.cloneDeep(analytics), rows };
}

export function refineCategories(
  series: readonly { data: readonly { name: string; categoryLabels?: readonly string[] }[] }[]
): DisplayCategoryTuple[] {
  const points = series[0]?.data || [];
  return points.map(point => {
    const labels = point.categoryLabels || point.name.split('_');
    const leaf = labels.length > 1 ? labels.slice(1).join(' — ') : labels[0];
    const parent = labels.length > 1 ? labels[0] : undefined;
    return { leaf, ...(parent ? { parent } : {}), name: leaf };
  });
}

export function limitCategories<T>(
  items: readonly T[],
  limit: number | undefined
): T[] {
  return _.cloneDeep(limit === undefined ? [...items] : items.slice(0, Math.max(0, limit)));
}

export function resolveSeriesColors(
  series: readonly { data: readonly Record<string, any>[] }[],
  fallback: readonly string[]
): string[] {
  const colors = series
    .map((item) => item.data[0]?.['color'])
    .filter((color): color is string => !!color);
  return colors.length ? colors : [...fallback];
}

export function filterEmptySeriesPoints(chart: any, configuration: SelectionConfiguration): any {
  const groups = _.flatten(
    (configuration.dataSelections || [])
      .map((selection: any) => selection.groups)
      .filter(Boolean)
  );
  const members = _.flatten(
    groups.map((group: any) =>
      group.members.map((member: any) => `${member.id}_${group.id}`)
    )
  );
  const indexes = chart.series.map((item: any) =>
    item.data
      .map((point: any, index: number) =>
        point.y === '' || (members.length > 0 && !members.includes(point.id))
          ? index
          : -1
      )
      .filter((index: number) => index !== -1)
  );
  let removed: number[] = [];
  indexes.forEach((list: number[]) => {
    removed = removed.length === 0 ? list : _.intersection(removed, list);
  });
  const series = chart.series.map((item: any) => ({
    ...item,
    data: item.data
      .map((point: any) => {
        const id = (point.id || point.drilldown || '').split('_');
        const group: any = _.find(groups, ['id', id[1]]);
        return group &&
          _.some(group.members, (member: any) => member.id === id[0]) &&
          group.color
          ? { ...point, color: group.color }
          : point;
      })
      .filter((_point: any, index: number) => !removed.includes(index)),
  }));
  const tuples: DisplayCategoryTuple[] = (chart.xAxis?.categories || [])
    .filter((_category: DisplayCategoryTuple, index: number) => !removed.includes(index));
  return _.cloneDeep({
    ...chart,
    series,
    xAxis: {
      ...chart.xAxis,
      categories: tuples.map(tuple => tuple.leaf ?? tuple.name),
      ...(tuples.some(tuple => tuple.parent) ? { categoryTuples: tuples.map(({ leaf, parent }) => ({ leaf, parent })) } : {}),
    },
  });
}
