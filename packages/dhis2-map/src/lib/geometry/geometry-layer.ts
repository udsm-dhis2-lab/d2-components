import * as turf from '@turf/turf';
import type { Feature, Geometry } from 'geojson';
import type { MapGeoFeature } from '../models/map-geo-feature.model';

export interface GeometryLayerOptions {
  kind: 'facility' | 'orgUnit';
  color?: string;
  groupColors?: Readonly<Record<string, string>>;
  areaRadius?: number;
}
export interface GeometryLayerResult {
  features: Feature[];
  missingGeometryIds: string[];
  bufferCount: number;
}
const safeColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
const point = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2 &&
  typeof value[0] === 'number' && Number.isFinite(value[0]) && Math.abs(value[0]) <= 180 &&
  typeof value[1] === 'number' && Number.isFinite(value[1]) && Math.abs(value[1]) <= 90;
const ring = (value: unknown): value is [number, number][] =>
  Array.isArray(value) && value.length >= 4 && value.every(point) &&
  value[0][0] === value[value.length - 1][0] && value[0][1] === value[value.length - 1][1];
const polygon = (value: unknown): value is [number, number][][] =>
  Array.isArray(value) && value.length > 0 && value.every(ring);

export function parseGeometry(raw: string): Geometry | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (point(value)) return { type: 'Point', coordinates: value };
  if (polygon(value)) return { type: 'Polygon', coordinates: value };
  if (Array.isArray(value) && value.length > 0 && value.every(polygon))
    return { type: 'MultiPolygon', coordinates: value };
  return null;
}

/** Geometry-only transformation; buffers are straight-line circles, never catchments. */
export function buildGeometryLayer(geo: readonly MapGeoFeature[], options: GeometryLayerOptions): GeometryLayerResult {
  if (options.color != null && !safeColor(options.color)) throw new Error('Invalid geometry layer color');
  if (options.areaRadius != null &&
    (!Number.isFinite(options.areaRadius) || options.areaRadius <= 0 || options.areaRadius > 100000))
    throw new Error('areaRadius must be between 0 and 100000 metres');
  const features: Feature[] = [];
  const missingGeometryIds: string[] = [];
  let bufferCount = 0;
  for (const item of geo) {
    const geometry = parseGeometry(item.co);
    if (!geometry) { missingGeometryIds.push(item.id); continue; }
    const groupId = typeof item.dimensions === 'object' && item.dimensions !== null &&
      typeof item.dimensions['group'] === 'string' ? item.dimensions['group'] as string : undefined;
    const groupColor = groupId ? options.groupColors?.[groupId] : undefined;
    const color = safeColor(groupColor) ? groupColor : options.color || '#404b5a';
    const properties = { id: item.id, name: item.na || item.id, color,
      geometryKind: geometry.type === 'Point' ? 'point' : 'associated-geometry' };
    features.push({ type: 'Feature', geometry, properties });
    if (options.kind === 'facility' && options.areaRadius && geometry.type === 'Point') {
      const buffer = turf.circle(geometry.coordinates, options.areaRadius / 1000, {
        units: 'kilometers', steps: 32,
      });
      features.push({ type: 'Feature', geometry: buffer.geometry,
        properties: { ...properties, geometryKind: 'straight-line-buffer', radiusMetres: options.areaRadius } });
      bufferCount++;
    }
  }
  return { features, missingGeometryIds, bufferCount };
}
