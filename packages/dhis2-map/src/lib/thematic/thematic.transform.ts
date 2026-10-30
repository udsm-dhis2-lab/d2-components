import * as turf from '@turf/turf';
import type { Feature, Geometry } from 'geojson';
import type { MapAnalytics } from '../map-data-source';
import type { MapGeoFeature } from '../models/map-geo-feature.model';
import type { LegendSet } from '../models/legend-set.model';
import type { ThematicClass, ThematicDatum, ThematicOptions, ThematicResult, ThematicValueState } from './thematic.model';

function validPoint(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 &&
    typeof value[0] === 'number' && Number.isFinite(value[0]) && value[0] >= -180 && value[0] <= 180 &&
    typeof value[1] === 'number' && Number.isFinite(value[1]) && value[1] >= -90 && value[1] <= 90;
}
function geometry(raw: string): Geometry | null {
  let coordinates: unknown;
  try { coordinates = JSON.parse(raw); } catch { return null; }
  if (validPoint(coordinates)) return { type: 'Point', coordinates };
  const isRing = (ring: unknown): ring is [number, number][] =>
    Array.isArray(ring) && ring.length >= 4 && ring.every(validPoint) &&
    ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const isPolygon = (shape: unknown): shape is [number, number][][] =>
    Array.isArray(shape) && shape.length > 0 && shape.every(isRing);
  if (isPolygon(coordinates)) return { type: 'Polygon', coordinates };
  if (Array.isArray(coordinates) && coordinates.length > 0 && coordinates.every(isPolygon))
    return { type: 'MultiPolygon', coordinates };
  return null;
}
function value(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const parsed = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
/** Stable OU IDs, never display labels, define the join. */
export function joinThematicData(geo: readonly MapGeoFeature[], analytics: MapAnalytics): ThematicDatum[] {
  const byId = new Map<string, number | null>();
  for (const row of analytics?.rows || []) {
    const id = (row['ou'] as { id?: unknown } | undefined)?.id;
    if (typeof id === 'string' && !byId.has(id)) byId.set(id, value(row['value']));
  }
  return geo.map(item => ({ id: item.id, name: item.na || item.id,
    geometry: geometry(item.co), value: byId.get(item.id) ?? null }));
}
function validate(options: ThematicOptions): void {
  if (options.mode !== 'CHOROPLETH' && options.mode !== 'BUBBLE') throw new Error(`Unsupported thematic mode: ${options.mode}`);
  if (![1, 2, 3, 10].includes(options.method)) throw new Error(`Thematic legend method ${options.method} is deferred`);
  if (options.method === 10 && options.mode !== 'BUBBLE') throw new Error('Single-colour method 10 is bubble-only');
  if (options.method === 1 && !options.legendSet?.legends?.length) throw new Error('Predefined method 1 requires legendSet.legends');
  if (options.method === 1 && options.legendSet!.legends.some(item =>
    !Number.isFinite(item.startValue) || !Number.isFinite(item.endValue) || item.endValue < item.startValue || !item.color))
    throw new Error('Predefined legend contains an invalid interval or color');
  if ((options.method === 2 || options.method === 3) &&
    (!Number.isInteger(options.classes) || !options.classes || options.classes < 1 || options.classes > 20))
    throw new Error('Automatic thematic classification requires 1–20 classes');
  if ((options.method === 2 || options.method === 3) && options.colorScale?.split(',').length !== options.classes)
    throw new Error('Automatic thematic colorScale must contain one color per class');
  if (options.method === 10 && !options.colorScale?.trim()) throw new Error('Bubble method 10 requires a colorScale');
  if (options.mode === 'BUBBLE') {
    const low = options.radiusLow ?? 5; const high = options.radiusHigh ?? 30;
    if (!Number.isFinite(low) || !Number.isFinite(high) || low < 0 || high > 50 || high < low)
      throw new Error('Bubble radius limits must satisfy 0 ≤ low ≤ high ≤ 50');
  }
  if (options.opacity != null && (!Number.isFinite(options.opacity) || options.opacity < 0 || options.opacity > 1))
    throw new Error('Thematic opacity must be between 0 and 1');
}
export function thematicClasses(data: readonly ThematicDatum[], options: ThematicOptions): ThematicClass[] {
  validate(options);
  if (options.method === 1) return options.legendSet!.legends.map(legend => ({
    min: legend.startValue, max: legend.endValue, color: legend.color, label: legend.name }));
  if (options.method === 10) return [];
  const values = data.map(item => item.value).filter((item): item is number => item != null);
  if (!values.length) return [];
  const min = Math.min(...values); const max = Math.max(...values);
  const colors = options.colorScale!.split(',').map(color => color.trim());
  if (options.method === 3) {
    const sorted = [...values].sort((a, b) => a - b);
    return colors.map((color, index) => {
      const lower = index ? sorted[Math.ceil(index * sorted.length / colors.length) - 1] : min;
      const upper = sorted[Math.ceil((index + 1) * sorted.length / colors.length) - 1];
      return { min: lower, max: upper, color, label: `${lower} - ${upper}` };
    });
  }
  return colors.map((color, index) => ({
    min: min + (max - min) * index / colors.length,
    max: min + (max - min) * (index + 1) / colors.length,
    color,
    label: `${min + (max - min) * index / colors.length} - ${min + (max - min) * (index + 1) / colors.length}`,
  }));
}
function classified(value: number, classes: readonly ThematicClass[]): ThematicClass | undefined {
  if (classes.length && classes.every(item => item.min === value && item.max === value)) return classes[0];
  return classes.find((item, index) => value >= item.min &&
    (value < item.max || (index === classes.length - 1 && value <= item.max)));
}
function bubbleGeometry(input: Geometry): Geometry | null {
  if (input.type === 'Point') return input;
  if (input.type !== 'Polygon' && input.type !== 'MultiPolygon') return null;
  const point = turf.pointOnFeature({ type: 'Feature', properties: {}, geometry: input });
  return validPoint(point.geometry.coordinates) ? point.geometry : null;
}
function radius(value: number, values: readonly number[], options: ThematicOptions): number {
  const low = options.radiusLow ?? 5; const high = options.radiusHigh ?? 30;
  const min = Math.min(...values); const max = Math.max(...values);
  return min === max ? (low + high) / 2 : low + (value - min) * (high - low) / (max - min);
}
export function buildThematic(data: readonly ThematicDatum[], options: ThematicOptions): ThematicResult {
  const classes = thematicClasses(data, options);
  if (options.mode === 'BUBBLE' && data.some(item => item.value != null && item.value < 0))
    throw new Error('Bubble counts must be non-negative');
  const counts: Record<ThematicValueState, number> = {
    value: 0, zero: 0, 'missing-value': 0, unclassified: 0, 'missing-geometry': 0 };
  const missingGeometry: string[] = [];
  const values = data.map(item => item.value).filter((item): item is number => item != null);
  const features: Feature[] = [];
  for (const item of data) {
    const shape = item.geometry && (options.mode === 'BUBBLE' ? bubbleGeometry(item.geometry) :
      item.geometry.type === 'Polygon' || item.geometry.type === 'MultiPolygon' ? item.geometry : null);
    if (!shape) { counts['missing-geometry']++; missingGeometry.push(item.id); continue; }
    const selected = item.value == null ? undefined : options.method === 3
      ? classes.find(entry => item.value! <= entry.max) : classified(item.value, classes);
    const state: ThematicValueState = item.value == null ? 'missing-value' :
      options.method !== 10 && !selected ? 'unclassified' : item.value === 0 ? 'zero' : 'value';
    counts[state]++;
    const color = state === 'missing-value' ? options.noDataColor || '#ffffff' :
      state === 'unclassified' ? options.unclassifiedColor || '#f5f5f5' :
        options.method === 10 ? options.colorScale!.trim() : selected!.color;
    features.push({ type: 'Feature', geometry: shape, properties: {
      id: item.id, name: item.name, value: item.value, valueState: state, color,
      ...(options.mode === 'BUBBLE' ? { radius: item.value == null ? 0 : radius(item.value, values, options) } : {}),
    } });
  }
  const baseLegendSet: LegendSet = options.method === 1 ? options.legendSet! : {
    id: 'thematic-legend', name: 'Legend', legends: options.method === 10
      ? [{ id: 'single-color', name: 'Values', color: options.colorScale!.trim(),
        startValue: values.length ? Math.min(...values) : 0, endValue: values.length ? Math.max(...values) : 0 }]
      : classes.map((item, index) => ({
        id: `class-${index}`, name: item.label, color: item.color, startValue: item.min, endValue: item.max })),
  };
  const extraLegends = [
    counts['missing-value'] ? { id: 'no-data', name: 'No data',
      color: options.noDataColor || '#ffffff', startValue: 0, endValue: 0,
      valueState: 'missing-value' } : null,
    counts.unclassified ? { id: 'unclassified', name: 'Unclassified',
      color: options.unclassifiedColor || '#f5f5f5', startValue: 0, endValue: 0,
      valueState: 'unclassified' } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
  const legendSet: LegendSet = { ...baseLegendSet,
    legends: [...baseLegendSet.legends, ...extraLegends] };
  return { features: { type: 'FeatureCollection', features }, missingGeometry, counts, classes, legendSet };
}
