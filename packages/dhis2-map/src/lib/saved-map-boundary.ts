/** A version must be supplied by the caller; payload shape is not a version oracle. */
export type MapCoreVersion = '2.41.3' | '2.43';
export type MapLayerKind = 'thematic' | 'facility' | 'boundary' | 'orgUnit' | 'legacy';
export interface MapViewport { longitude: number; latitude: number; zoom: number }
export interface MapBasemap { id: string; opacity?: number; hidden?: boolean; [key: string]: unknown }
export interface MapSource { kind: 'analytics' | 'geometry'; selections?: readonly unknown[] }
export interface MapPeriod { kind: 'single'; id?: string }
export type MapLayerRequest =
  | { kind: 'thematic'; layer: SavedMapLayer; source: MapSource; period?: MapPeriod }
  | { kind: 'facility' | 'orgUnit'; layer: SavedMapLayer; source: MapSource; period?: MapPeriod }
  | { kind: 'unsupported'; layer: SavedMapLayer; originalKind: string };
export interface SavedMapLayer { id: string; layer: string; config: Record<string, unknown>; raw: Record<string, unknown> }
export interface SavedMapRequest {
  version: MapCoreVersion;
  viewport: MapViewport;
  basemaps: readonly MapBasemap[];
  layers: readonly SavedMapLayer[];
  raw: Record<string, unknown>;
}

const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
function object(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${path} must be an object`);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !forbidden.has(key)));
}
function decoded(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'string') return object(value, path);
  try { return object(JSON.parse(value), path); }
  catch { throw new Error(`${path} must contain a valid JSON object`); }
}
function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${path} must be a finite number`);
  return value;
}
function basemap(value: unknown, path: string): MapBasemap {
  const item = decoded(value, path);
  if (typeof item['id'] !== 'string' || !item['id']) throw new Error(`${path}.id is required`);
  return item as MapBasemap;
}

export function parseSavedMap(input: unknown, version: MapCoreVersion): SavedMapRequest {
  if (version !== '2.41.3' && version !== '2.43') throw new Error(`Unsupported map Core version: ${version}`);
  const raw = object(input, 'map');
  const views = raw['mapViews'];
  if (!Array.isArray(views)) throw new Error('map.mapViews must be an array');
  const basemaps = version === '2.41.3'
    ? raw['basemap'] == null ? [] : [basemap(raw['basemap'], 'map.basemap')]
    : Array.isArray(raw['basemaps'])
      ? raw['basemaps'].map((item, index) => basemap(item, `map.basemaps[${index}]`))
      : (() => { throw new Error('map.basemaps must be an array'); })();
  return {
    version,
    viewport: {
      longitude: finite(raw['longitude'], 'map.longitude'),
      latitude: finite(raw['latitude'], 'map.latitude'),
      zoom: finite(raw['zoom'], 'map.zoom'),
    },
    basemaps,
    layers: views.map((value, index) => {
      const view = object(value, `map.mapViews[${index}]`);
      if (typeof view['id'] !== 'string' || !view['id'] || typeof view['layer'] !== 'string' || !view['layer'])
        throw new Error(`map.mapViews[${index}] requires id and layer`);
      return { id: view['id'], layer: view['layer'],
        config: view['config'] == null ? {} : decoded(view['config'], `map.mapViews[${index}].config`), raw: view };
    }),
    raw,
  };
}

export function serializeSavedMap(request: SavedMapRequest): Record<string, unknown> {
  const result: Record<string, unknown> = { ...request.raw, ...request.viewport,
    mapViews: request.layers.map(({ raw, config }) => ({ ...raw,
      config: raw['config'] == null ? raw['config'] : JSON.stringify(config) })) };
  if (request.version === '2.41.3') {
    delete result['basemaps'];
    result['basemap'] = request.basemaps[0] ? JSON.stringify(request.basemaps[0]) : null;
  } else {
    delete result['basemap'];
    result['basemaps'] = request.basemaps.map(item => ({ ...item }));
  }
  return result;
}

/** Classification is intentionally narrower than the catalogue's family list. */
export function toMapLayerRequest(layer: SavedMapLayer): MapLayerRequest {
  if (layer.layer === 'thematic')
    return { kind: 'thematic', layer, source: { kind: 'analytics' } };
  if (layer.layer === 'facility' || layer.layer === 'orgUnit' || layer.layer === 'boundary')
    return { kind: layer.layer === 'boundary' ? 'orgUnit' : layer.layer,
      layer, source: { kind: 'geometry' } };
  return { kind: 'unsupported', layer, originalKind: layer.layer };
}
