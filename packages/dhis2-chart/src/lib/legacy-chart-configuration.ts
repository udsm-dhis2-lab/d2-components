import { AnalyticalBoundaryError, BoundaryIssue, isRecord } from './analytical-dataset';

export interface LegacyChartConfiguration {
  type: string;
  xAxisType: readonly string[];
  yAxisType: string;
  /** Native and legacy properties are preserved for round-trip use. */
  native: Readonly<Record<string, unknown>>;
}

/** Validates the fields required by the current helper and retains all others. */
export function adaptLegacyChartConfiguration(input: unknown): LegacyChartConfiguration {
  const issues: BoundaryIssue[] = [];
  if (!isRecord(input)) {
    throw new AnalyticalBoundaryError([{
      path: 'configuration', code: 'INVALID_CONFIG', message: 'Expected a chart configuration object',
    }]);
  }
  const type = input['type'];
  const scatter = typeof type === 'string' && type.toUpperCase() === 'SCATTER';
  const xAxisType = input['xAxisType'] ?? (scatter ? [] : undefined);
  const yAxisType = input['yAxisType'] ?? (scatter ? 'dx' : undefined);
  if (typeof type !== 'string' || !type) issues.push({
    path: 'configuration.type', code: 'INVALID_CHART_TYPE', message: 'Expected a chart type',
  });
  if (!Array.isArray(xAxisType) || !xAxisType.every((id) => typeof id === 'string')) issues.push({
    path: 'configuration.xAxisType', code: 'INVALID_CATEGORY_LAYOUT',
    message: 'Expected an array of dimension identifiers',
  });
  const seriesDimension = Array.isArray(yAxisType) && yAxisType.length === 1
    ? yAxisType[0] : yAxisType;
  if (typeof seriesDimension !== 'string' || !seriesDimension) issues.push({
    path: 'configuration.yAxisType', code: 'INVALID_SERIES_LAYOUT',
    message: 'Expected one series dimension identifier',
  });
  if (issues.length) throw new AnalyticalBoundaryError(issues);
  return {
    type: type as string,
    xAxisType: [...(xAxisType as string[])],
    yAxisType: seriesDimension as string,
    native: { ...input },
  };
}
