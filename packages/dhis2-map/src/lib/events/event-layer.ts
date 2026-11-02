import type { FeatureCollection, Point } from 'geojson';

export type EventCoordinateField = 'EVENT' | 'ENROLLMENT' | 'TRACKER' |
  'eventgeometry' | 'enrollmentgeometry' | 'tegeometry' | 'ougeometry' |
  'psigeometry' | 'pigeometry' | 'teigeometry' | string;
export interface EventSelection {
  /** Explicit application-level approval for rendering exact, potentially sensitive points. */
  locationAccess: 'precise';
  program: string;
  stage?: string;
  startDate: string;
  endDate: string;
  organisationUnits: readonly string[];
  coordinateField: EventCoordinateField;
  eventStatus?: 'ACTIVE' | 'COMPLETED' | 'SCHEDULED' | 'OVERDUE' | 'SKIPPED';
  programStatus?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  styleItem?: string;
  coordinateOuFallback?: false;
  /** DHIS2 query expands selected OUs; response authorization remains server-owned. */
  serverAuthorizedDescendants?: boolean;
}
export interface EventProjectionPolicy {
  allowedOrganisationUnits: readonly string[];
  styleItem?: string;
  serverAuthorizedDescendants?: boolean;
}
export interface EventQueryResponse {
  headers: readonly { name: string }[];
  rows: readonly (readonly unknown[])[];
}
export interface EventClusterViewport {
  clusterSize: number;
  bbox: readonly [number, number, number, number];
}
/** Calibrated against the saved zoom-8 map; one zoom doubles/halves map scale. */
export function clusterSizeForZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) throw new Error('Event cluster zoom must be finite');
  return Math.round(Math.max(500, Math.min(2_000_000, 70_000 * 2 ** (8 - zoom))));
}
const uid = /^[A-Za-z][A-Za-z0-9]{10}$/;
const date = /^\d{4}-\d{2}-\d{2}$/;
const fields = new Set(['EVENT','ENROLLMENT','TRACKER','eventgeometry','enrollmentgeometry',
  'tegeometry','ougeometry','psigeometry','pigeometry','teigeometry']);
function validate(selection: EventSelection): void {
  if (selection.locationAccess !== 'precise')
    throw new Error('Precise event location access must be explicitly approved');
  if (!uid.test(selection.program) || selection.stage && !uid.test(selection.stage))
    throw new Error('Event program/stage must be DHIS2 UIDs');
  if (!date.test(selection.startDate) || !date.test(selection.endDate) || selection.startDate > selection.endDate)
    throw new Error('Event layer requires an explicit valid date range');
  if (!selection.organisationUnits.length || selection.organisationUnits.some(id => !uid.test(id)))
    throw new Error('Event layer requires explicit organisation unit UIDs');
  if (!fields.has(selection.coordinateField) && !uid.test(selection.coordinateField))
    throw new Error('Unsupported event coordinate field');
  if (selection.coordinateOuFallback !== undefined && selection.coordinateOuFallback !== false)
    throw new Error('Event coordinate fallback is not supported');
  if (selection.styleItem && !uid.test(selection.styleItem))
    throw new Error('Event style item must be a DHIS2 UID');
}
export function eventRequest(selection: EventSelection, page: number): string {
  validate(selection);
  if (!Number.isInteger(page) || page < 1 || page > 20) throw new Error('Event page limit exceeded');
  const params = new URLSearchParams({ startDate: selection.startDate, endDate: selection.endDate,
    coordinateField: selection.coordinateField, coordinatesOnly: 'true',
    coordinateOuFallback: 'false', page: String(page), pageSize: '100' });
  if (selection.stage) params.set('stage', selection.stage);
  params.append('dimension', `ou:${selection.organisationUnits.join(';')}`);
  if (selection.styleItem) params.append('dimension', selection.styleItem);
  if (selection.eventStatus) params.set('eventStatus', selection.eventStatus);
  if (selection.programStatus) params.set('programStatus', selection.programStatus);
  return `/api/analytics/events/query/${selection.program}?${params}`;
}
export class FetchEventDataSource {
  constructor(private readonly fetcher: typeof fetch = fetch) {}
  async load(selection: EventSelection, baseUrl: string, signal?: AbortSignal): Promise<EventQueryResponse> {
    const rows: (readonly unknown[])[] = [];
    let headers: EventQueryResponse['headers'] = [];
    for (let page = 1; page <= 20; page++) {
      if (signal?.aborted) throw new DOMException('Event load aborted', 'AbortError');
      const response = await this.fetcher.call(globalThis, `${baseUrl}${eventRequest(selection, page)}`, {signal});
      if (!response.ok) throw new Error(`Event query failed with ${response.status}`);
      const payload = await response.json() as EventQueryResponse;
      if (!Array.isArray(payload.headers) || !Array.isArray(payload.rows))
        throw new TypeError('Invalid event query response');
      if (page === 1) headers = payload.headers;
      else if (payload.headers.map(item => item.name).join('|') !== headers.map(item => item.name).join('|'))
        throw new TypeError('Event query headers changed between pages');
      rows.push(...payload.rows);
      if (payload.rows.length < 100) return {headers, rows};
    }
    throw new Error('Event query exceeded 2000-row safety limit');
  }
  async loadClusters(selection: EventSelection, baseUrl: string, signal?: AbortSignal,
    viewport: EventClusterViewport = {clusterSize:70_000,bbox:[-180,-90,180,90]}): Promise<EventQueryResponse> {
    validate(selection);
    if (selection.styleItem)
      throw new Error('Styled event cluster composition requires a verified category payload');
    const [west,south,east,north] = viewport.bbox;
    if (!Number.isSafeInteger(viewport.clusterSize) || viewport.clusterSize < 500 || viewport.clusterSize > 2_000_000 ||
      ![west,south,east,north].every(Number.isFinite) || west < -180 || east > 180 ||
      south < -90 || north > 90 || west >= east || south >= north)
      throw new Error('Invalid event cluster viewport');
    const params = new URLSearchParams({startDate:selection.startDate,endDate:selection.endDate,
      coordinateField:selection.coordinateField,clusterSize:String(viewport.clusterSize),
      bbox:viewport.bbox.join(','),includeClusterPoints:'false'});
    if (selection.stage) params.set('stage',selection.stage);
    if (selection.eventStatus) params.set('eventStatus',selection.eventStatus);
    if (selection.programStatus) params.set('programStatus',selection.programStatus);
    params.append('dimension',`ou:${selection.organisationUnits.join(';')}`);
    const response = await this.fetcher.call(globalThis,
      `${baseUrl}/api/analytics/events/cluster/${selection.program}?${params}`,{signal});
    if (!response.ok) throw new Error(`Event cluster query failed with ${response.status}`);
    const payload = await response.json() as EventQueryResponse;
    if (!Array.isArray(payload.headers) || !Array.isArray(payload.rows))
      throw new TypeError('Invalid event cluster response');
    return payload;
  }
}
function coordinates(raw: unknown): [number, number] | null {
  let value = raw;
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw); } catch { return null; }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const geometry = value as {type?:unknown;coordinates?:unknown};
    if (geometry.type !== 'Point') return null;
    value = geometry.coordinates;
  }
  if (!Array.isArray(value) || value.length !== 2) return null;
  const [longitude, latitude] = value;
  return typeof longitude === 'number' && typeof latitude === 'number' &&
    Number.isFinite(longitude) && Number.isFinite(latitude) &&
    longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
      ? [longitude, latitude] : null;
}
/** Only authorized, non-identifying fields cross into the map provider. */
export function eventFeatures(response: EventQueryResponse, policy: EventProjectionPolicy): FeatureCollection<Point> {
  const index = (name: string) => response.headers.findIndex(header => header.name === name);
  const coordinateIndex = index('geometry') >= 0 ? index('geometry') : index('coordinates');
  const ouIndex = index('ou');
  const styleIndex = policy.styleItem ? index(policy.styleItem) : -1;
  if (coordinateIndex < 0 || ouIndex < 0 || policy.styleItem && styleIndex < 0)
    throw new TypeError('Event response lacks required coordinate, OU or style headers');
  const allowed = new Set(policy.allowedOrganisationUnits);
  return { type: 'FeatureCollection', features: response.rows.flatMap(row => {
    if (!Array.isArray(row) || !policy.serverAuthorizedDescendants && !allowed.has(String(row[ouIndex]))) return [];
    const point = coordinates(row[coordinateIndex]);
    if (!point) return [];
    const rawCategory = styleIndex < 0 ? undefined : row[styleIndex];
    const category = typeof rawCategory === 'string' && rawCategory.length <= 100 ? rawCategory : undefined;
    return [{ type: 'Feature' as const, geometry: {type:'Point' as const,coordinates:point},
      properties: category === undefined ? {} : {category} }];
  }) };
}

/** DHIS2 cluster counts are authoritative for the query, not client-sampled totals. */
export function clusterFeatures(response: EventQueryResponse): FeatureCollection<Point> {
  const countIndex = response.headers.findIndex(item => item.name === 'count');
  const centerIndex = response.headers.findIndex(item => item.name === 'center');
  if (countIndex < 0 || centerIndex < 0) throw new TypeError('Cluster response lacks count or center');
  return {type:'FeatureCollection',features:response.rows.flatMap(row => {
    const count = Number(row[countIndex]);
    const point = coordinates(row[centerIndex]);
    if (!Number.isSafeInteger(count) || count < 1 || !point) return [];
    const abbreviated = count >= 10000 ? `${Math.floor(count / 1000)}k` :
      count >= 1000 ? `${Number((count / 1000).toFixed(1))}k` : String(count);
    return [{type:'Feature' as const,geometry:{type:'Point' as const,coordinates:point},
      properties:{point_count:count,point_count_abbreviated:abbreviated}}];
  })};
}
