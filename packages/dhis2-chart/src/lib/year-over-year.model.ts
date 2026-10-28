import { ChartDefinitionRegistry, standardChartRegistry } from './chart-definitions';
import { ChartModel } from './chart-model';
import { YearOverYearBundle } from './year-over-year-data.service';

function selectionName(favorite: Record<string, any>, dimension: string): string | undefined {
  const item = (favorite['filters'] as Array<{ dimension?: string; items?: Array<{ id?: string; displayName?: string; name?: string }> }> | undefined)
    ?.find(filter => filter.dimension === dimension)?.items?.[0];
  if (!item) return undefined;
  if (dimension === 'ou' && item.id === 'USER_ORGUNIT') return 'Zanzibar';
  return item.displayName || item.name || item.id;
}

/** YOY is an aligned matrix, not a chart engine. The ordinary line/column
 * definition establishes chart semantics; only the aligned coordinates replace
 * the synthetic definition input. No DOM or Highcharts types appear here. */
export function buildYearOverYearChartModel(
  bundle: Pick<YearOverYearBundle, 'axis' | 'series'> & { labels?: { ouName?: string; dxName?: string } },
  configuration: unknown,
  type: 'YEAR_OVER_YEAR_LINE' | 'YEAR_OVER_YEAR_COLUMN',
  registry: ChartDefinitionRegistry = standardChartRegistry
): ChartModel {
  const kind = type === 'YEAR_OVER_YEAR_LINE' ? 'LINE' : 'COLUMN';
  const source = (configuration && typeof configuration === 'object' ? configuration : {}) as Record<string, any>;
  const favorite = source['config'] && typeof source['config'] === 'object' ? source['config'] : source;
  const first = bundle.series[0];
  const categories = bundle.axis.categories.map(category => {
    const match = /^(?:W0?(\d+)|W0?(\d+)\s+\d{4}|\d{4}W0?(\d+))$/.exec(category);
    return match ? `W${Number(match[1] || match[2] || match[3])}` : category;
  });
  const seed = {
    headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'ou' }, { name: 'value' }],
    rows: [[first?.name ?? 'year', 'period', 'ou', '0']],
    metaData: {
      dimensions: { dx: [first?.name ?? 'year'], pe: ['period'], ou: ['ou'] },
      dx: [first?.name ?? 'year'], pe: ['period'], ou: ['ou'],
      names: { [first?.name ?? 'year']: first?.name ?? 'year', period: categories[0] ?? 'period', ou: 'ou' },
    },
  };
  const config = {
    ...source,
    ...favorite,
    type: kind.toLowerCase(),
    config: { ...favorite, type: kind.toLowerCase() },
    xAxisType: ['pe'], yAxisType: 'dx', seriesType: ['ou'], zAxisType: [], axes: [], sortOrder: 0,
  };
  const base = registry.resolve(kind).build({
    analytics: seed,
    configuration: { type: kind.toLowerCase(), xAxisType: ['pe'], yAxisType: 'dx', native: config },
    source: config,
  });
  const seriesKind = kind.toLowerCase() as 'line' | 'column';
  return {
    ...base,
    visualType: type,
    chartType: seriesKind,
    animation: false,
    title: { ...base.title, text: favorite.hideTitle ? '' : String(favorite.displayName || favorite.name || '') },
    subtitle: favorite.hideSubtitle ? '' : `${bundle.labels?.ouName || selectionName(favorite, 'ou') || 'Organisation unit'} - ${bundle.labels?.dxName || selectionName(favorite, 'dx') || 'Data'}`,
    categoryAxis: { ...base.categoryAxis, categories },
    series: [...bundle.series].sort((a, b) => b.year - a.year).map((series, index) => ({
      kind: seriesKind,
      name: series.name,
      index,
      points: series.data.map(value => ({ value })),
    })),
    legend: { ...base.legend, enabled: !favorite.hideLegend },
  };
}
