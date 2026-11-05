import type { MapCoreVersion } from './saved-map-boundary';

export type MapPeriodMode = 'SINGLE' | 'TIMELINE' | 'SPLIT_BY_PERIOD';
export interface PeriodDescriptor { readonly id: string; readonly startDate: string }
export interface PeriodLayerDescriptor { readonly id: string; readonly periods: readonly string[] }
export interface PeriodFrameLayer { readonly id: string; readonly state: 'available' | 'missing' | 'unavailable' }
export interface PeriodFrame {
  readonly periodId: string;
  readonly startDate: string;
  readonly layers: readonly PeriodFrameLayer[];
}
export interface PeriodFrameRequest {
  readonly mode: MapPeriodMode;
  readonly version: MapCoreVersion;
  readonly periods: readonly PeriodDescriptor[];
  readonly layers: readonly PeriodLayerDescriptor[];
  /** A fetched frame with no rows is empty, not missing; only failed/unfetched frames belong here. */
  readonly missing?: Readonly<Record<string, readonly string[]>>;
}

/** Pure planning only: no analytics query or geometry fetch is performed here. */
export function buildPeriodFrames(request: PeriodFrameRequest): readonly PeriodFrame[] {
  if (!['SINGLE','TIMELINE','SPLIT_BY_PERIOD'].includes(request.mode))
    throw new Error(`Unsupported map period mode: ${request.mode}`);
  if (request.mode !== 'SINGLE' && request.version !== '2.43')
    throw new Error(`${request.mode} requires a verified Core 2.43 Maps-app contract`);
  if (!request.periods.length) throw new Error('Map periods cannot be empty');
  const ids = new Set<string>();
  for (const period of request.periods) {
    if (!period.id || ids.has(period.id)) throw new Error(`Duplicate or empty map period: ${period.id}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(period.startDate) ||
      Number.isNaN(Date.parse(`${period.startDate}T00:00:00Z`)))
      throw new Error(`Invalid start date for map period ${period.id}`);
    ids.add(period.id);
  }
  const layerIds = new Set<string>();
  for (const layer of request.layers) {
    if (!layer.id || layerIds.has(layer.id)) throw new Error(`Duplicate or empty map layer: ${layer.id}`);
    layerIds.add(layer.id);
    for (const id of layer.periods) if (!ids.has(id))
      throw new Error(`Unknown period ${id} for map layer ${layer.id}`);
    if (request.mode === 'SPLIT_BY_PERIOD' &&
      (layer.periods.length !== ids.size || layer.periods.some(id => !ids.has(id))))
      throw new Error('Split map layers must use matching periods');
  }
  return [...request.periods].sort((a,b)=>a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id))
    .map(period=>({periodId:period.id,startDate:period.startDate,
      layers:request.layers.map(layer=>({id:layer.id,
        state: !layer.periods.includes(period.id) ? 'unavailable' as const :
          request.missing?.[layer.id]?.includes(period.id) ? 'missing' as const : 'available' as const}))}));
}
