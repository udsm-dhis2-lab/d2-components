import type { Feature, Point } from 'geojson';
import { MapLayer } from '../map-layer.model';
import type { MapSelection } from '../../map-data-source';

const uid = /^[A-Za-z][A-Za-z0-9]{10}$/;
const date = /^\d{4}-\d{2}-\d{2}$/;
const color = /^#[0-9a-fA-F]{6}$/;

export interface TrackerLayerSelection {
  locationAccess: 'precise' | 'none';
  trackedEntityType: string;
  program?: string;
  programStatus?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  followUp?: boolean;
  organisationUnits: readonly string[];
  organisationUnitMode: 'SELECTED' | 'CHILDREN' | 'DESCENDANTS';
  periodType: 'lastUpdated' | 'program';
  startDate?: string;
  endDate?: string;
}
export interface TrackerDataSource {
  loadTrackedEntities(selection: TrackerLayerSelection, baseUrl: string, signal?: AbortSignal): Promise<readonly unknown[]>;
}

function id(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof (value as {id?:unknown}).id === 'string')
    return (value as {id:string}).id;
  return undefined;
}

export function parseTrackerConfig(value: unknown): {periodType:'lastUpdated'|'program'; relationships: Record<string, unknown> | null} {
  let decoded: unknown = value ?? {};
  if (typeof decoded === 'string') {
    try { decoded = JSON.parse(decoded); } catch { throw new Error('Invalid tracked-entity layer config JSON'); }
  }
  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded))
    throw new Error('Tracked-entity layer config must be an object');
  const input = decoded as Record<string, unknown>;
  const periodType = input['periodType'] ?? 'lastUpdated';
  if (periodType !== 'lastUpdated' && periodType !== 'program')
    throw new Error('Unsupported tracked-entity periodType');
  const relationships = input['relationships'] ?? null;
  if (relationships !== null) {
    if (typeof relationships !== 'object' || Array.isArray(relationships))
      throw new Error('Tracked-entity relationships must be an object or null');
    const fields = relationships as Record<string, unknown>;
    if (!uid.test(String(fields['type'] ?? '')) ||
        fields['pointColor'] != null && !color.test(String(fields['pointColor'])) ||
        fields['lineColor'] != null && !color.test(String(fields['lineColor'])) ||
        fields['pointRadius'] != null && (typeof fields['pointRadius'] !== 'number' ||
          !Number.isFinite(fields['pointRadius']) || fields['pointRadius'] < 1 || fields['pointRadius'] > 30) ||
        fields['relationshipOutsideProgram'] != null && typeof fields['relationshipOutsideProgram'] !== 'boolean')
      throw new Error('Invalid tracked-entity relationship config');
  }
  return {periodType, relationships:relationships as Record<string, unknown>|null};
}

export function trackerSelection(view: Record<string, unknown>, selections: readonly MapSelection[]): TrackerLayerSelection {
  const config = parseTrackerConfig(view['config']);
  const organisationUnits = selections.filter(item => item.dimension === 'ou')
    .flatMap(item => item.items.map(value => value.dimensionItem || value.id).filter((value):value is string => Boolean(value)));
  const mode = view['organisationUnitSelectionMode'] ?? 'SELECTED';
  const program = id(view['program']);
  const status = view['programStatus'];
  const followUp = view['followUp'];
  const startDate = typeof view['startDate'] === 'string' ? view['startDate'].slice(0,10) : undefined;
  const endDate = typeof view['endDate'] === 'string' ? view['endDate'].slice(0,10) : undefined;
  const type = id(view['trackedEntityType']);
  const access = view['locationAccess'] ?? 'precise';
  if (access !== 'precise' && access !== 'none') throw new Error('Unsupported tracked-entity location access');
  if (!type || !uid.test(type) || program && !uid.test(program)) throw new Error('Tracked-entity type/program must be DHIS2 UIDs');
  if (!organisationUnits.length || organisationUnits.some(value => !uid.test(value)))
    throw new Error('Tracked-entity layer requires explicit organisation unit UIDs');
  if (mode !== 'SELECTED' && mode !== 'CHILDREN' && mode !== 'DESCENDANTS')
    throw new Error('Unsupported tracked-entity organisation unit mode');
  if (status != null && (!program || !['ACTIVE','COMPLETED','CANCELLED'].includes(String(status))))
    throw new Error('Tracked-entity programStatus requires a program and valid status');
  if (followUp != null && (!program || typeof followUp !== 'boolean'))
    throw new Error('Tracked-entity followUp requires a program and boolean value');
  if (config.periodType === 'program' && !program) throw new Error('Program period requires a program');
  if (startDate && !date.test(startDate) || endDate && !date.test(endDate) ||
      startDate && endDate && startDate > endDate)
    throw new Error('Invalid tracked-entity date range');
  return {locationAccess:access, trackedEntityType:type, program,
    programStatus:status as TrackerLayerSelection['programStatus'], followUp:followUp as boolean|undefined,
    organisationUnits, organisationUnitMode:mode, periodType:config.periodType,startDate,endDate};
}

export function trackerRequest(selection: TrackerLayerSelection, page = 1): string {
  if (selection.locationAccess !== 'precise') throw new Error('Precise tracked-entity location access is required');
  if (!Number.isInteger(page) || page < 1 || page > 20) throw new Error('Tracked-entity page limit exceeded');
  if (!uid.test(selection.trackedEntityType) || selection.program && !uid.test(selection.program) ||
      !selection.organisationUnits.length || selection.organisationUnits.some(value => !uid.test(value)) ||
      !['SELECTED','CHILDREN','DESCENDANTS'].includes(selection.organisationUnitMode))
    throw new Error('Invalid tracked-entity request scope');
  const params = new URLSearchParams({trackedEntityType:selection.trackedEntityType,
    orgUnits:selection.organisationUnits.join(','),orgUnitMode:selection.organisationUnitMode,
    pageSize:'100',page:String(page)});
  if (selection.program) params.set('program',selection.program);
  if (selection.programStatus) params.set('enrollmentStatus',selection.programStatus);
  if (selection.followUp !== undefined) params.set('followUp',String(selection.followUp));
  if (selection.startDate) params.set(selection.periodType === 'program' ? 'enrollmentEnrolledAfter':'updatedAfter',selection.startDate);
  if (selection.endDate) params.set(selection.periodType === 'program' ? 'enrollmentEnrolledBefore':'updatedBefore',selection.endDate);
  return `/api/tracker/trackedEntities?${params}`;
}

function point(raw: unknown): [number,number] | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as {type?:unknown;coordinates?:unknown};
  if (value.type !== 'Point' || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) return null;
  const [longitude,latitude] = value.coordinates;
  return typeof longitude === 'number' && typeof latitude === 'number' &&
    Number.isFinite(longitude) && Number.isFinite(latitude) &&
    longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
    ? [longitude,latitude] : null;
}

/** Provider properties contain no TE identifiers, attributes or raw enrollment records. */
export function trackerFeatures(instances: readonly unknown[], selection: TrackerLayerSelection,
  colorValue = '#333333'): Feature<Point>[] {
  if (selection.locationAccess !== 'precise') return [];
  const allowed = new Set(selection.organisationUnits);
  const safeColor = color.test(colorValue) ? colorValue : '#333333';
  return instances.flatMap(raw => {
    if (!raw || typeof raw !== 'object') return [];
    const item = raw as Record<string, unknown>;
    const itemOu = id(item['orgUnit']);
    if (selection.organisationUnitMode === 'SELECTED' && !allowed.has(itemOu || '')) return [];
    if (item['trackedEntityType'] && id(item['trackedEntityType']) !== selection.trackedEntityType) return [];
    const enrollments = Array.isArray(item['enrollments']) ? item['enrollments'] as Record<string,unknown>[] : [];
    const geometries = point(item['geometry']) ? [item['geometry']] : enrollments
      .filter(enrollment => !selection.program || id(enrollment['program']) === selection.program)
      .map(enrollment => enrollment['geometry']);
    return geometries.flatMap(geometry => {
      const coordinates = point(geometry);
      return coordinates ? [{type:'Feature' as const,geometry:{type:'Point' as const,coordinates},
        properties:{color:safeColor}}] : [];
    });
  });
}

export class TrackedEntityMapLayer extends MapLayer {
  private readonly trackerSource?: TrackerDataSource;
  private readonly supplied?: readonly unknown[];
  trackerSelection!: TrackerLayerSelection;
  constructor(view: Record<string, unknown>, source?: TrackerDataSource, supplied?: readonly unknown[]) {
    super(view as Partial<MapLayer>);
    this.layer = 'trackedEntity';
    this.trackerSource = source;
    this.supplied = supplied;
  }
  override async loadFeatures(signal?: AbortSignal): Promise<void> {
    this.trackerSelection = trackerSelection(this as unknown as Record<string, unknown>, this.dataSelections || []);
    if (this.trackerSelection.locationAccess !== 'precise') {
      this.features = [];
      this.fillType = 'circle';
      return;
    }
    if (this.supplied && this.trackerSelection.organisationUnitMode !== 'SELECTED')
      throw new Error('Supplied tracked entities require explicit SELECTED organisation units');
    const instances = this.supplied ?? await (this.trackerSource || new (await import('./tracker-data-source')).FetchTrackerDataSource())
      .loadTrackedEntities(this.trackerSelection,this.baseUrl,signal);
    if (signal?.aborted) return;
    this.features = trackerFeatures(instances,this.trackerSelection,this.eventPointColor);
    this.fillType = 'circle';
    if (this.features.length && !this.legendSet) {
      const displayColor = color.test(this.eventPointColor || '') ? this.eventPointColor! : '#333333';
      this.legendSet = {id:`${this.id}-legend`,name:this.name || 'Tracked entities',
        legends:[{id:`${this.id}-points`,name:this.name || 'Tracked entities',
          color:displayColor,startValue:0,endValue:0}]};
    }
  }
}
