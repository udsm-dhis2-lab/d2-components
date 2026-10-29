import { AnalyticalBoundaryError, isRecord } from './analytical-dataset';
import { normalizeAnalyticalData } from './analytics-boundary';
import { ChartModel, ChartOverlayModel, requiredChartModules } from './chart-model';
import type { ChartBuildContext } from './chart-definitions';
import { detectScatterOutliers, extremeScatterLines, OutlierMethod, pairScatterMeasures, regressScatter, RegressionKind } from './scatter-statistics';
import { buildEmbeddedChartExportingOptions, buildFilterSubtitle } from './chart/transforms/presentation.transforms';

function option(source: Record<string, unknown>, name: string): unknown {
  const nested = isRecord(source['config']) ? source['config'] : {};
  return nested[name] ?? source[name];
}
function fail(path: string, message: string): never {
  throw new AnalyticalBoundaryError([{ path, code: 'INVALID_SCATTER', message }]);
}

function columnMeasures(source: Record<string, unknown>): string[] {
  const columns = option(source, 'columns');
  if (!Array.isArray(columns)) return [];
  const dx = columns.filter(column => isRecord(column) && column['dimension'] === 'dx');
  if (dx.length !== 1) return [];
  const items = dx[0]['items'];
  if (!Array.isArray(items)) return [];
  return items.map(item => isRecord(item) ? item['dimensionItem'] ?? item['id'] : undefined)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/** Pure SCATTER definition boundary; never reads DOM or invokes Highcharts. */
export function buildScatterChartModel(context: ChartBuildContext): ChartModel {
  const source = context.source && typeof context.source === 'object'
    ? context.source as Record<string, unknown> : context.configuration.native;
  const dataset = normalizeAnalyticalData(context.analytics);
  const seriesOptions = option(source, 'series');
  const assignments = Array.isArray(seriesOptions) ? seriesOptions : [];
  const byAxis = (index: number) => assignments.filter(item => isRecord(item) && (item['axis'] ?? item['axix']) === index);
  const xAssigned = byAxis(1);
  const yAssigned = byAxis(0);
  if (xAssigned.length > 1 || yAssigned.length > 1) fail('configuration.series', 'Scatter accepts exactly one measure on each axis');
  const orderedMeasures = columnMeasures(source);
  const xMeasureId = option(source, 'xMeasureId') ?? (xAssigned[0] as Record<string, unknown> | undefined)?.['dimensionItem'] ?? (orderedMeasures.length === 2 ? orderedMeasures[1] : undefined);
  const yMeasureId = option(source, 'yMeasureId') ?? (yAssigned[0] as Record<string, unknown> | undefined)?.['dimensionItem'] ?? (orderedMeasures.length === 2 ? orderedMeasures[0] : undefined);
  if (typeof xMeasureId !== 'string' || typeof yMeasureId !== 'string') fail('configuration.scatter', 'Specify xMeasureId/yMeasureId, one series assignment for each RANGE axis, or exactly two dx column items');
  const entityDimension = option(source, 'entityDimension') ?? 'ou';
  if (typeof entityDimension !== 'string') fail('configuration.entityDimension', 'Expected a dimension identifier');
  const points = pairScatterMeasures(dataset, xMeasureId, yMeasureId, entityDimension);
  const overlays: ChartOverlayModel[] = [];
  const regression = option(source, 'regressionType');
  if (regression !== undefined && regression !== 'NONE') {
    if (!['LINEAR', 'POLYNOMIAL', 'LOESS'].includes(String(regression))) fail('configuration.regressionType', 'Expected NONE, LINEAR, POLYNOMIAL or LOESS');
    const result = regressScatter(points, regression as RegressionKind);
    overlays.push({ kind: 'regression', name: `${regression} regression`, points: result.points });
  }
  const outlier = option(source, 'outlierAnalysis');
  if (outlier !== undefined && !isRecord(outlier)) fail('configuration.outlierAnalysis', 'Expected an outlier settings object');
  if (isRecord(outlier) && outlier['enabled'] === true) {
    if (outlier['normalizationMethod'] !== undefined && outlier['normalizationMethod'] !== 'Y_RESIDUALS_LINEAR') fail('configuration.outlierAnalysis.normalizationMethod', 'Only Y_RESIDUALS_LINEAR is supported');
    const method = outlier['outlierMethod'] ?? 'IQR';
    if (!['IQR', 'STANDARD_Z_SCORE', 'MODIFIED_Z_SCORE'].includes(String(method))) fail('configuration.outlierAnalysis.outlierMethod', 'Unknown outlier method');
    const threshold = outlier['thresholdFactor'];
    if (outlier['maxResults'] !== undefined) fail('configuration.outlierAnalysis.maxResults', 'maxResults is reserved for OUTLIER_TABLE; use scatterOutlierLimit for a library-local overlay cap');
    const limit = option(source, 'scatterOutlierLimit');
    if (threshold !== undefined && typeof threshold !== 'number') fail('configuration.outlierAnalysis.thresholdFactor', 'Expected a positive number');
    if (limit !== undefined && typeof limit !== 'number') fail('configuration.scatterOutlierLimit', 'Expected a result limit number');
    const flagged = detectScatterOutliers(points, method as OutlierMethod, threshold as number | undefined, limit as number | undefined).flagged;
    overlays.push({ kind: 'outliers', name: 'Potential outliers', points: flagged.map(point => ({ id: point.entityId, name: point.name, x: point.x, y: point.y })) });
    const extreme = outlier['extremeLines'];
    if (isRecord(extreme) && extreme['enabled'] === true) {
      const percentage = extreme['value'] ?? 1;
      if (typeof percentage !== 'number') fail('configuration.outlierAnalysis.extremeLines.value', 'Expected a percentage number');
      overlays.push(...extremeScatterLines(points, percentage).map(line => ({ kind: 'extreme-line' as const, ...line })));
    }
  }
  const names = dataset.metadata.names;
  const subtitle = option(source, 'subtitle');
  const fontStyle = option(source, 'fontStyle');
  const subtitleStyle = isRecord(fontStyle) && isRecord(fontStyle['visualizationSubtitle']) ? fontStyle['visualizationSubtitle'] : undefined;
  return {
    kind: 'CHART_MODEL', visualType: 'scatter', chartType: 'scatter', seriesKind: 'scatter',
    renderTarget: String(option(source, 'renderId') ?? option(source, 'id') ?? ''),
    title: { text: null },
    subtitle: buildFilterSubtitle(option(source, 'filters'), names, typeof subtitle === 'string' ? subtitle : undefined, option(source, 'hideSubtitle') === true, subtitleStyle),
    palette: ['#4b89c8'],
    categoryAxis: { title: { text: names[xMeasureId] ?? xMeasureId }, labels: { style: { color: '#404b5a', fontSize: '11px' } } },
    valueAxes: [{ title: { text: names[yMeasureId] ?? yMeasureId }, labels: { style: { color: '#404b5a', fontSize: '11px' } } }],
    series: [{ kind: 'scatter', id: 'scatter', name: `${names[yMeasureId] ?? yMeasureId} vs ${names[xMeasureId] ?? xMeasureId}`, points: points.map(point => ({ id: point.entityId, name: point.name, x: point.x, value: point.y })) }],
    overlays,
    seriesPresentation: { scatter: { marker: { radius: 4 } } },
    tooltip: { pointFormat: '{point.name}: ({point.x}, {point.y})' },
    credits: { enabled: false }, exporting: buildEmbeddedChartExportingOptions(), annotations: [],
    accessibility: { enabled: true, description: `Scatter chart of ${names[yMeasureId] ?? yMeasureId} against ${names[xMeasureId] ?? xMeasureId} for ${points.length} matched entities` },
    requiredModules: requiredChartModules('scatter', false),
  };
}
