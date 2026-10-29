import { AnalyticalBoundaryError, AnalyticalDataset } from './analytical-dataset';

export interface ScatterPoint {
  readonly entityId: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
}

export type RegressionKind = 'LINEAR' | 'POLYNOMIAL' | 'LOESS';
export type OutlierMethod = 'IQR' | 'STANDARD_Z_SCORE' | 'MODIFIED_Z_SCORE';
export interface RegressionPoint { readonly x: number; readonly y: number }
export interface RegressionResult {
  readonly kind: RegressionKind;
  readonly points: readonly RegressionPoint[];
  readonly predict: (x: number) => number;
}
export interface OutlierResult {
  readonly method: OutlierMethod;
  readonly threshold: number;
  readonly flagged: readonly ScatterPoint[];
  readonly scores: readonly { readonly entityId: string; readonly score: number }[];
}

function invalid(path: string, message: string): never {
  throw new AnalyticalBoundaryError([{ path, code: 'INVALID_SCATTER', message }]);
}
function finite(value: number, path: string): void {
  if (!Number.isFinite(value)) invalid(path, 'Expected a finite number');
}

/** Pair only observations with the same entity and every other dimension. */
export function pairScatterMeasures(dataset: AnalyticalDataset, xMeasureId: string, yMeasureId: string, entityDimension = 'ou'): ScatterPoint[] {
  if (!xMeasureId || !yMeasureId || xMeasureId === yMeasureId) invalid('scatter.measures', 'Select two distinct measure identifiers');
  if (!dataset.dimensions.some(dimension => dimension.id === 'dx' && dimension.items.some(item => item.id === xMeasureId))) invalid('scatter.xMeasureId', 'Unknown x measure');
  if (!dataset.dimensions.some(dimension => dimension.id === 'dx' && dimension.items.some(item => item.id === yMeasureId))) invalid('scatter.yMeasureId', 'Unknown y measure');
  const entities = dataset.dimensions.find(dimension => dimension.id === entityDimension);
  if (!entities) invalid('scatter.entityDimension', `Unknown entity dimension ${entityDimension}`);
  const paired = new Map<string, { entityId: string; context: string; x?: number; y?: number }>();
  for (const observation of dataset.observations) {
    const measure = observation.coordinates['dx'];
    if (measure !== xMeasureId && measure !== yMeasureId) continue;
    const entityId = observation.coordinates[entityDimension];
    if (!entityId) invalid('scatter.entityDimension', 'Every measure row requires an entity identifier');
    const context = Object.entries(observation.coordinates)
      .filter(([dimension]) => dimension !== 'dx' && dimension !== entityDimension)
      .sort(([a], [b]) => a.localeCompare(b));
    const key = JSON.stringify([entityId, context]);
    const current = paired.get(key) ?? { entityId, context: context.map(([dimension, value]) => `${dimension}:${value}`).join(', ') };
    if (observation.value.kind === 'number') {
      if (measure === xMeasureId) {
        if (current.x !== undefined) invalid('scatter.analytics', `Duplicate x value for ${entityId}`);
        current.x = observation.value.value;
      } else {
        if (current.y !== undefined) invalid('scatter.analytics', `Duplicate y value for ${entityId}`);
        current.y = observation.value.value;
      }
    }
    paired.set(key, current);
  }
  const names = new Map(entities.items.map(item => [item.id, item.name]));
  const complete = [...paired.values()].filter((value): value is typeof value & { x: number; y: number } => value.x !== undefined && value.y !== undefined);
  if (new Set(complete.map(value => value.context)).size > 1) invalid('scatter.analytics', 'Scatter requires one shared non-entity context (for example one period)');
  return complete
    .map(value => ({ entityId: value.entityId, name: `${names.get(value.entityId) ?? value.entityId}${value.context ? ` (${value.context})` : ''}`, x: value.x, y: value.y }));
}

function validatePoints(points: readonly ScatterPoint[], minimum: number): void {
  if (points.length < minimum) invalid('scatter.points', `At least ${minimum} complete pairs are required`);
  points.forEach((point, index) => { finite(point.x, `scatter.points[${index}].x`); finite(point.y, `scatter.points[${index}].y`); });
  if (new Set(points.map(point => point.x)).size < 2) invalid('scatter.points', 'Regression requires distinct x values');
}

function fitLine(points: readonly RegressionPoint[], weights?: readonly number[]): (x: number) => number {
  const weight = weights ?? points.map(() => 1);
  const total = weight.reduce((sum, value) => sum + value, 0);
  if (total <= 0) invalid('scatter.regression', 'Regression weights have no support');
  const xMean = points.reduce((sum, point, index) => sum + weight[index] * point.x, 0) / total;
  const yMean = points.reduce((sum, point, index) => sum + weight[index] * point.y, 0) / total;
  const variance = points.reduce((sum, point, index) => sum + weight[index] * (point.x - xMean) ** 2, 0);
  if (![xMean, yMean, variance].every(Number.isFinite)) invalid('scatter.regression', 'Regression magnitude exceeds finite precision');
  if (variance <= 1e-12) invalid('scatter.regression', 'Regression requires distinct x values');
  const slope = points.reduce((sum, point, index) => sum + weight[index] * (point.x - xMean) * (point.y - yMean), 0) / variance;
  if (!Number.isFinite(slope)) invalid('scatter.regression', 'Regression slope is not finite');
  return x => yMean + slope * (x - xMean);
}

function solve3(matrix: number[][], values: number[]): number[] {
  const rows = matrix.map((row, index) => [...row, values[index]]);
  for (let column = 0; column < 3; column++) {
    let pivot = column;
    for (let row = column + 1; row < 3; row++) if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    if (Math.abs(rows[pivot][column]) < 1e-12) invalid('scatter.regression', 'Polynomial fit is singular');
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    const divisor = rows[column][column];
    for (let entry = column; entry < 4; entry++) rows[column][entry] /= divisor;
    for (let row = 0; row < 3; row++) if (row !== column) {
      const factor = rows[row][column];
      for (let entry = column; entry < 4; entry++) rows[row][entry] -= factor * rows[column][entry];
    }
  }
  return rows.map(row => row[3]);
}

/** Quadratic polynomial and tricube local-linear LOESS are explicit library strategies. */
export function regressScatter(points: readonly ScatterPoint[], kind: RegressionKind, span = 0.75): RegressionResult {
  validatePoints(points, kind === 'POLYNOMIAL' ? 3 : kind === 'LOESS' ? 4 : 2);
  const ordered = [...points].sort((a, b) => a.x - b.x);
  let predict: (x: number) => number;
  if (kind === 'LINEAR') predict = fitLine(ordered);
  else if (kind === 'POLYNOMIAL') {
    if (new Set(points.map(point => point.x)).size < 3) invalid('scatter.regression', 'Quadratic fit requires three distinct x values');
    const sums = Array.from({ length: 5 }, (_, power) => ordered.reduce((total, point) => total + point.x ** power, 0));
    const rhs = Array.from({ length: 3 }, (_, power) => ordered.reduce((total, point) => total + point.y * point.x ** power, 0));
    const [a, b, c] = solve3([[sums[0], sums[1], sums[2]], [sums[1], sums[2], sums[3]], [sums[2], sums[3], sums[4]]], rhs);
    predict = x => a + b * x + c * x * x;
  } else if (kind === 'LOESS') {
    if (!(span > 0 && span <= 1)) invalid('scatter.regression.span', 'LOESS span must be in (0, 1]');
    const neighborCount = Math.max(3, Math.ceil(span * ordered.length));
    predict = x => {
      const neighbors = [...ordered].sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x)).slice(0, neighborCount);
      const radius = Math.max(...neighbors.map(point => Math.abs(point.x - x)));
      if (radius === 0) return neighbors.reduce((sum, point) => sum + point.y, 0) / neighbors.length;
      const weights = neighbors.map(point => (1 - (Math.abs(point.x - x) / radius) ** 3) ** 3);
      try { return fitLine(neighbors, weights)(x); }
      catch { return neighbors.reduce((sum, point, index) => sum + point.y * weights[index], 0) / weights.reduce((sum, value) => sum + value, 0); }
    };
  } else invalid('scatter.regression.kind', `Unknown regression strategy ${kind}`);
  const samples = [...new Set(ordered.map(point => point.x))].map(x => ({ x, y: predict(x) }));
  if (samples.some(point => !Number.isFinite(point.y))) invalid('scatter.regression', 'Regression produced a non-finite value');
  return { kind, points: samples, predict };
}

function quantile(sorted: readonly number[], fraction: number): number {
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  return sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower);
}

/** Scores vertical residuals from a linear baseline, matching the DHIS2 scatter description. */
export function detectScatterOutliers(points: readonly ScatterPoint[], method: OutlierMethod, threshold?: number, maxResults?: number): OutlierResult {
  validatePoints(points, 3);
  const factor = threshold ?? (method === 'IQR' ? 1.5 : 3);
  if (!Number.isFinite(factor) || factor <= 0) invalid('scatter.outlierAnalysis.thresholdFactor', 'Threshold must be positive');
  if (maxResults !== undefined && (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 500)) invalid('scatter.outlierAnalysis.maxResults', 'Result limit must be an integer from 1 to 500');
  const baseline = fitLine(points);
  const residuals = points.map(point => point.y - baseline(point.x));
  const sorted = [...residuals].sort((a, b) => a - b);
  const median = quantile(sorted, 0.5);
  const deviations = residuals.map(value => Math.abs(value - median));
  const mad = quantile([...deviations].sort((a, b) => a - b), 0.5);
  const mean = residuals.reduce((sum, value) => sum + value, 0) / residuals.length;
  const sd = Math.sqrt(residuals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / residuals.length);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const tolerance = residuals.reduce((maximum, value) => Math.max(maximum, Math.abs(value) * 1e-12), 1e-12);
  const scores = points.map((point, index) => {
    const value = residuals[index];
    const score = method === 'IQR' ? iqr <= tolerance ? (Math.abs(value - median) <= tolerance ? 0 : Number.POSITIVE_INFINITY) : Math.max((q1 - value) / iqr, (value - q3) / iqr, 0)
      : method === 'STANDARD_Z_SCORE' ? sd <= tolerance ? 0 : Math.abs((value - mean) / sd)
      : method === 'MODIFIED_Z_SCORE' ? mad <= tolerance ? (Math.abs(value - median) <= tolerance ? 0 : Number.POSITIVE_INFINITY) : Math.abs(0.6745 * (value - median) / mad)
      : invalid('scatter.outlierAnalysis.outlierMethod', `Unknown outlier method ${method}`);
    return { entityId: point.entityId, score };
  });
  const flagged = points.map((point, index) => ({ point, score: scores[index].score }))
    .filter(item => item.score > factor).sort((a, b) => b.score - a.score)
    .slice(0, maxResults ?? points.length).map(item => item.point);
  return { method, threshold: factor, flagged, scores };
}

export function extremeScatterLines(points: readonly ScatterPoint[], percentage: number): readonly { axis: 'x' | 'y'; value: number }[] {
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage >= 50) invalid('scatter.outlierAnalysis.extremeLines.value', 'Extreme-line percentage must be between 0 and 50');
  if (points.length < 2) invalid('scatter.points', 'Extreme lines require at least two pairs');
  return (['x', 'y'] as const).flatMap(axis => {
    const sorted = points.map(point => point[axis]).sort((a, b) => a - b);
    return [{ axis, value: quantile(sorted, percentage / 100) }, { axis, value: quantile(sorted, 1 - percentage / 100) }];
  });
}
