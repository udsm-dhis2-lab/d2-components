import { ChartTitle } from '../models';

export function buildTitleOptions(
  configuration: { hideTitle: boolean; zAxisType: string[] },
  metadata: Record<string, unknown>
) {
  return new ChartTitle(configuration, metadata).title;
}

/** Keep the in-chart export menu hidden; the dashboard card owns its controls. */
export function buildEmbeddedChartExportingOptions() {
  return { buttons: { contextButton: { enabled: false } } };
}

/** Resolve favorite filter labels for the small in-chart subtitle. */
export function buildFilterSubtitle(
  filters: unknown,
  names: Readonly<Record<string, string>>,
  explicit?: string,
  hidden = false,
  fontStyle?: Readonly<Record<string, unknown>>
): { text: string | null; align: 'center'; style: Record<string, unknown> } {
  if (hidden) return { text: null, align: 'center', style: { fontWeight: 400, fontSize: '11px' } };
  const label = explicit ?? (Array.isArray(filters) ? filters.map(filter => {
    if (!filter || typeof filter !== 'object') return '';
    const items = (filter as Record<string, unknown>)['items'];
    if (!Array.isArray(items)) return '';
    return items.map((item: unknown) => {
      if (!item || typeof item !== 'object') return '';
      const value = item as Record<string, unknown>;
      const id = value['dimensionItem'] ?? value['id'];
      const raw = value['displayName'] ?? value['name'] ?? (typeof id === 'string' ? names[id] ?? id : '');
      if (typeof raw !== 'string') return '';
      return /^[A-Z][A-Z0-9_]*$/.test(raw) && raw.includes('_')
        ? raw.toLowerCase().replace(/_/g, ' ').replace(/^./, char => char.toUpperCase())
        : raw;
    }).filter(Boolean).join(', ');
  }).filter(Boolean).join(' - ') : '');
  return { text: label || null, align: 'center', style: {
    fontWeight: 400,
    fontSize: '11px',
    ...(typeof fontStyle?.['textColor'] === 'string' ? { color: fontStyle['textColor'] } : {}),
    ...(typeof fontStyle?.['fontSize'] === 'number' ? { fontSize: `${fontStyle['fontSize']}px` } : {}),
    ...(typeof fontStyle?.['bold'] === 'boolean' ? { fontWeight: fontStyle['bold'] ? 'bold' : 'normal' } : {}),
    ...(typeof fontStyle?.['italic'] === 'boolean' ? { fontStyle: fontStyle['italic'] ? 'italic' : 'normal' } : {}),
  } };
}

export function buildLegendOptions(configuration: {
  legendAlign?: string;
  reverseLegend?: boolean;
}) {
  return {
    align: configuration.legendAlign,
    reversed: configuration.reverseLegend,
    layout:
      configuration.legendAlign === 'right' ||
      configuration.legendAlign === 'left'
        ? 'vertical'
        : 'horizontal',
    y: configuration.legendAlign === 'bottom' ? 25 : 0,
  };
}

export function buildDataLabelOptions(configuration: {
  type: string;
  showData?: boolean;
}) {
  return configuration.type === 'pie'
    ? {
        enabled: configuration.showData,
        format:
          '{point.name}<br/> <b>{point.y}</b> ( {point.percentage:.1f} % )',
      }
    : { enabled: configuration.showData };
}

export function buildTooltipOptions(
  configuration: { type: string },
  allowedType: string
) {
  if (!allowedType) return {};
  if (allowedType === 'solidgauge') return { enabled: false };
  if (allowedType === 'pie')
    return {
      pointFormat:
        '{series.name}<br/> <b>{point.y}</b> ( {point.percentage:.1f} % )',
    };
  if (configuration.type === 'stacked_column')
    return {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}',
    };
  return { enabled: true };
}

export function resolveStacking(configuration: {
  type: string;
  percentStackedValues?: boolean;
}): 'percent' | 'normal' | undefined {
  return ['stacked_column', 'stacked_bar', 'stacked_area', 'area'].includes(configuration.type)
    ? configuration.percentStackedValues
      ? 'percent'
      : 'normal'
    : undefined;
}

export function formatAxisNumber(
  decimals: number | undefined
): string | undefined {
  return decimals !== undefined ? `{value:.${decimals ?? 1}f}` : undefined;
}

export function buildReferenceLines(configuration: {
  targetLineValue?: number;
  targetLineLabel?: string;
  baseLineValue?: number;
  baseLineLabel?: string;
}) {
  return [
    {
      color: '#000000',
      dashStyle: 'Solid',
      value: configuration.targetLineValue,
      width: 2,
      zIndex: 1000,
      label: { text: configuration.targetLineLabel },
    },
    {
      color: '#000000',
      dashStyle: 'Solid',
      value: configuration.baseLineValue,
      zIndex: 1000,
      width: 2,
      label: { text: configuration.baseLineLabel },
    },
  ];
}
