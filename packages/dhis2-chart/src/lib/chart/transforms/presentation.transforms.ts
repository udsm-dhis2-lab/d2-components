import { ChartTitle } from '../models';

export function buildTitleOptions(
  configuration: { hideTitle: boolean; zAxisType: string[] },
  metadata: Record<string, unknown>
) {
  return new ChartTitle(configuration, metadata).title;
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
