import type {
  FacilityGroup,
  MapAnalytics,
  MapDataSource,
  MapSelection,
} from '../map-data-source';
import { normalizeMapAnalytics } from '../map-data-source';
import type { LegendSet } from '../models/legend-set.model';
import type { Feature, FeatureCollection } from 'geojson';
import {
  DigitGroupSeparator,
  GeoJSON,
  MapLayerType,
  MapRenderingStrategy,
  TitleOption,
} from '../models';
import { MapGeoFeature } from '../models/map-geo-feature.model';
import { GeoJSONUtil, LegendSetUtil } from '../utils';
import { buildThematic, joinThematicData } from '../thematic/thematic.transform';
import { thematicMapboxStyle } from '../thematic/thematic-mapbox.adapter';
import type { ThematicMode } from '../thematic/thematic.model';
import { buildGeometryLayer } from '../geometry/geometry-layer';
import { clusterFeatures, eventFeatures, type EventClusterViewport, type EventSelection } from '../events/event-layer';

export class MapLayer {
  /** Library fallback for historical views that did not save a colour scale. */
  static readonly legacyEqualCountPalette = ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'];
  id!: string;
  name!: string;
  program!: string;
  programStage?: {id:string};
  startDate?: string;
  endDate?: string;
  layer!: MapLayerType;
  renderingStrategy!: MapRenderingStrategy;
  sortOrder!: number;
  eventClustering!: boolean;
  opacity!: number;
  eventPointRadius!: number;
  eventPointColor?: string;
  eventSelection?: EventSelection;
  eventCoordinateField?: string;
  eventStyleItem?: string;
  eventCategoryColors?: Record<string, string>;
  serverClustersLoaded = false;
  hideSubtitle!: boolean;
  digitGroupSeparator!: DigitGroupSeparator;
  titleOption!: TitleOption;
  subtitleOption!: TitleOption;
  method!: number;
  classes!: number;
  colorScale!: string;
  noDataColor!: string;
  unclassifiedColor?: string;
  thematicMapType?: ThematicMode;
  radiusLow?: number;
  radiusHigh?: number;
  config?: string | Record<string, unknown>;
  hidden?: boolean;
  labels?: boolean;
  labelTemplate?: string;
  organisationUnitColor?: string;
  pointRadius?: number;
  areaRadius?: number;
  groupColors?: Record<string, string>;
  symbolBaseUrl?: string;
  organisationUnitGroupSet?: { id: string };
  facilityGroups: FacilityGroup[] = [];
  groupMetadataError?: unknown;
  bufferCount = 0;
  missingGeometryIds: readonly string[] = [];
  legendSet!: LegendSet;
  dataSelections!: MapSelection[];
  geoFeatures!: MapGeoFeature[];
  features!: Feature[];
  data!: MapAnalytics;
  mapSourceData!: FeatureCollection;
  fillType!: 'fill' | 'line' | 'circle';
  sourceType = 'geojson';
  baseUrl = '../../..';
  #periodGeometryCache = new Map<string, MapGeoFeature[]>();
  constructor(props?: Partial<MapLayer>, private dataSource?: MapDataSource) {
    if (props) Object.assign(this, props);
    if (this.layer === 'event' && !this.eventSelection) {
      let config: Record<string, unknown> = {};
      if (this.config) {
        try { config = typeof this.config === 'string' ? JSON.parse(this.config) : this.config; }
        catch { throw new Error(`Invalid event config for map layer "${this.id}"`); }
      }
      if (!config || typeof config !== 'object' || Array.isArray(config))
        throw new Error(`Invalid event config for map layer "${this.id}"`);
      if (config['coordinateOuFallback'] || config['fallbackCoordinateField'])
        throw new Error('Event coordinate fallback is not supported');
      if (config['eventCategoryColors'] && typeof config['eventCategoryColors'] === 'object' &&
          !Array.isArray(config['eventCategoryColors']))
        this.eventCategoryColors = config['eventCategoryColors'] as Record<string, string>;
      const program = this.program as unknown;
      const programId = typeof program === 'string' ? program :
        program && typeof program === 'object' ? (program as {id?: unknown}).id : undefined;
      const startDate = this.startDate || config['startDate'];
      const endDate = this.endDate || config['endDate'];
      // A saved DHIS2 event view is already an explicit request to display event locations.
      // The server remains responsible for access control; no identifiers reach the provider.
      if (typeof programId === 'string' && typeof startDate === 'string' &&
          typeof endDate === 'string')
        this.eventSelection = { locationAccess:'precise', program: programId,
          stage:this.programStage?.id, startDate:startDate.slice(0,10),
          endDate:endDate.slice(0,10), organisationUnits: [],
          coordinateField: this.eventCoordinateField || 'EVENT',
          serverAuthorizedDescendants:true, styleItem: this.eventStyleItem };
    }
    if ((this.layer === 'facility' || this.layer === 'orgUnit' || this.layer === 'boundary') && this.config) {
      let decoded: unknown;
      try { decoded = typeof this.config === 'string' ? JSON.parse(this.config) : this.config; }
      catch { throw new Error(`Invalid geometry config for map layer "${this.id}"`); }
      if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded))
        throw new Error(`Invalid geometry config for map layer "${this.id}"`);
      const settings = decoded as Record<string, unknown>;
      if (typeof settings['hidden'] === 'boolean') this.hidden = settings['hidden'];
      if (typeof settings['labels'] === 'boolean') this.labels = settings['labels'];
      if (typeof settings['organisationUnitColor'] === 'string')
        this.organisationUnitColor = settings['organisationUnitColor'];
      if (typeof settings['pointRadius'] === 'number') this.pointRadius = settings['pointRadius'];
      if (typeof settings['areaRadius'] === 'number') this.areaRadius = settings['areaRadius'];
      if (typeof settings['opacity'] === 'number') this.opacity = settings['opacity'];
      const groupSet = settings['organisationUnitGroupSet'];
      if (groupSet && typeof groupSet === 'object' && typeof (groupSet as { id?: unknown }).id === 'string')
        this.organisationUnitGroupSet = { id: (groupSet as { id: string }).id };
    }
    if (this.layer === 'thematic' && this.thematicMapType && this.config) {
      let decoded: unknown;
      try { decoded = typeof this.config === 'string' ? JSON.parse(this.config) : this.config; }
      catch { throw new Error(`Invalid thematic config for map layer "${this.id}"`); }
      if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded))
        throw new Error(`Invalid thematic config for map layer "${this.id}"`);
      const settings = decoded as Record<string, unknown>;
      const noData = settings['noDataLegend'];
      const unclassified = settings['unclassifiedLegend'];
      if (noData && typeof noData === 'object' && 'color' in noData && typeof noData.color === 'string')
        this.noDataColor = noData.color;
      if (unclassified && typeof unclassified === 'object' && 'color' in unclassified && typeof unclassified.color === 'string')
        this.unclassifiedColor = unclassified.color;
    }
  }

  setDataSource(dataSource: MapDataSource): MapLayer {
    this.dataSource = dataSource;
    return this;
  }

  /** Create an independent analytics view; the original saved layer is not mutated. */
  forPeriod(periodId: string): MapLayer {
    if (!periodId || !this.dataSource) throw new Error(`Cannot select period for map layer "${this.id}"`);
    if (this.layer === 'event' || this.layer === 'trackedEntity')
      throw new Error(`Period frames for ${this.layer} require an explicit dated source contract`);
    const selections = (this.dataSelections || []).filter(item => item.dimension !== 'pe');
    const originalSource = this.dataSource;
    const cache = this.#periodGeometryCache;
    const source: MapDataSource = {
      loadAnalytics: (...args) => originalSource.loadAnalytics(...args),
      ...(originalSource.loadFacilityGroups ? {loadFacilityGroups:(...args: Parameters<NonNullable<MapDataSource['loadFacilityGroups']>>)=>
        originalSource.loadFacilityGroups!(...args)} : {}),
      loadGeoFeatures: async (items, baseUrl, signal, options) => {
        const key = JSON.stringify({baseUrl,ou:items.filter(item=>item.dimension==='ou'),options});
        const hit = cache.get(key);
        if (hit) return hit;
        const features = await originalSource.loadGeoFeatures(items,baseUrl,signal,options);
        if (!signal?.aborted) {
          if (cache.size >= 4) cache.delete(cache.keys().next().value as string);
          cache.set(key,features);
        }
        return features;
      },
    };
    const copy = new MapLayer({...this,
      dataSelections:[...selections,{dimension:'pe',items:[{id:periodId}]}]},source);
    return copy;
  }

  setId(id: string) {
    this.id = id;
    return this;
  }

  setProgram(program: string) {
    this.program = program;
    return this;
  }

  setTitleOption(titleOption: TitleOption) {
    this.titleOption = titleOption;
    return this;
  }

  setSubtitleOption(subtitleOption: TitleOption) {
    this.subtitleOption = subtitleOption;
    return this;
  }

  setType(type: MapLayerType) {
    this.layer = type;
    return this;
  }

  setFillType(fillType?: 'fill' | 'line' | 'circle') {
    if (fillType) {
      this.fillType = fillType;
      return this;
    }

    switch (this.layer) {
      case 'boundary':
      case 'orgUnit': {
        this.fillType = 'line';
        return this;
      }
      case 'facility': {
        this.fillType = 'circle';
        return this;
      }

      default: {
        const isPointGeometry = (this.features || []).some(
          (feature) => feature.geometry.type === 'Point'
        );

        this.fillType = isPointGeometry ? 'circle' : 'fill';
        return this;
      }
    }
  }

  setRenderingStrategy(renderingStrategy: MapRenderingStrategy) {
    this.renderingStrategy = renderingStrategy;
    return this;
  }

  setSortOrder(sortOrder: number) {
    this.sortOrder = sortOrder;
    return this;
  }

  setEventClustering(eventClustering: boolean) {
    this.eventClustering = eventClustering;
    return this;
  }

  setOpacity(opacity: number) {
    this.opacity = opacity;
    return this;
  }

  setEventPointRadius(eventPointRadius: number) {
    this.eventPointRadius = eventPointRadius;
    return this;
  }

  setLegendSet(legendSet: LegendSet) {
    this.legendSet = legendSet;
    return this;
  }

  setDataSelections(dataSelections: MapSelection[]): MapLayer {
    this.dataSelections = dataSelections;
    return this;
  }

  setBaseUrl(baseUrl: string): MapLayer {
    this.baseUrl = baseUrl;
    return this;
  }

  async loadFeatures(signal?: AbortSignal) {
    if (!this.dataSource)
      throw new Error(`No data source configured for map layer "${this.id}"`);
    if (this.layer === 'event') {
      if (!this.dataSource.loadEvents) throw new Error(`Event data source is required for map layer "${this.id}"`);
      const selection = this.eventSelection && this.eventSelection.organisationUnits.length
        ? this.eventSelection : this.eventSelection && {
          ...this.eventSelection,
          organisationUnits: (this.dataSelections || []).find(item => item.dimension === 'ou')?.items
            .map(item => item.dimensionItem || item.id).filter((id): id is string => typeof id === 'string') || [],
        };
      if (!selection) throw new Error(`Explicit event selection is required for map layer "${this.id}"`);
      if (selection.locationAccess !== 'precise')
        throw new Error('Precise event location access must be explicitly approved');
      this.eventSelection = selection;
      const response = this.eventClustering && this.dataSource.loadEventClusters
        ? await this.dataSource.loadEventClusters(selection, this.baseUrl, signal)
        : await this.dataSource.loadEvents(selection, this.baseUrl, signal);
      if (signal?.aborted) return;
      this.serverClustersLoaded = Boolean(this.eventClustering && this.dataSource.loadEventClusters);
      this.features = this.eventClustering && this.dataSource.loadEventClusters
        ? clusterFeatures(response).features : eventFeatures(response, {
        allowedOrganisationUnits: selection.organisationUnits,
        styleItem: selection.styleItem,
        serverAuthorizedDescendants:selection.serverAuthorizedDescendants,
      }).features;
      this.#setMapSourceData();
      this.setFillType('circle');
      return;
    }
    if (this.layer === 'facility' || this.layer === 'orgUnit' || this.layer === 'boundary') {
      if (this.opacity != null && (!Number.isFinite(this.opacity) || this.opacity < 0 || this.opacity > 1))
        throw new Error(`Invalid opacity for map layer "${this.id}"`);
      if (this.pointRadius != null && (!Number.isFinite(this.pointRadius) || this.pointRadius < 1 || this.pointRadius > 30))
        throw new Error(`Invalid pointRadius for map layer "${this.id}"`);
      const groupSetId = this.layer === 'facility' ? this.organisationUnitGroupSet?.id : undefined;
      const [geoFeatures, groups] = await Promise.all([
        this.dataSource.loadGeoFeatures(this.dataSelections || [], this.baseUrl, signal,
          { includeGroupSets: Boolean(groupSetId) }),
        groupSetId && this.dataSource.loadFacilityGroups
          ? this.dataSource.loadFacilityGroups(groupSetId, this.baseUrl, signal)
              .catch(error => { this.groupMetadataError = error; return [] as FacilityGroup[]; })
          : Promise.resolve([] as FacilityGroup[]),
      ]);
      if (signal?.aborted) return;
      this.geoFeatures = geoFeatures;
      this.facilityGroups = groups;
      const groupByOu: Record<string, string> = {};
      const groupColors = { ...this.groupColors };
      for (const group of groups) {
        if (typeof group.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(group.color))
          groupColors[group.id] = group.color;
        for (const id of group.organisationUnitIds) groupByOu[id] ??= group.id;
      }
      if (groupSetId) for (const item of geoFeatures) {
        const id = item.dimensions?.[groupSetId];
        if (typeof id === 'string') groupByOu[item.id] = id;
      }
      const result = buildGeometryLayer(geoFeatures, {
        kind: this.layer === 'facility' ? 'facility' : 'orgUnit',
        color: this.organisationUnitColor,
        groupColors,
        groupByOu,
        areaRadius: this.areaRadius,
      });
      this.features = result.features;
      this.missingGeometryIds = result.missingGeometryIds;
      this.bufferCount = result.bufferCount;
      if (!this.legendSet && Object.keys(groupColors).length) {
        const usedGroups = new Set(this.features.map(item => item.properties?.['groupId'])
          .filter((id): id is string => typeof id === 'string' && Boolean(id)));
        this.legendSet = { id: `${this.id}-groups`, name: 'Facility groups',
          legends: Object.entries(groupColors)
            .filter(([id, color]) => usedGroups.has(id) && /^#[0-9a-fA-F]{6}$/.test(color))
            .map(([id, color]) => ({ id, name: groups.find(group => group.id === id)?.name || id,
              color, startValue: 0, endValue: 0 })) };
      }
      this.#setMapSourceData();
      this.setFillType();
      return;
    }
    const [geoFeatures, data] = await Promise.all([
      this.dataSource.loadGeoFeatures(this.dataSelections || [], this.baseUrl, signal),
      this.dataSource.loadAnalytics(this.dataSelections || [], signal),
    ]);
    if (signal?.aborted) return;
    this.geoFeatures = geoFeatures;
    this.data = normalizeMapAnalytics(data);

    this.#setFeatures();
    this.#setMapSourceData();
    this.setFillType();
  }

  async refreshEventClusters(viewport: EventClusterViewport, signal?: AbortSignal): Promise<FeatureCollection> {
    if (!this.serverClustersLoaded || !this.dataSource?.loadEventClusters || !this.eventSelection)
      throw new Error(`No server cluster source configured for map layer "${this.id}"`);
    const response = await this.dataSource.loadEventClusters(this.eventSelection, this.baseUrl, signal, viewport);
    if (signal?.aborted) return this.featureCollection;
    return clusterFeatures(response);
  }

  get paint() {
    if (this.layer === 'thematic' && this.thematicMapType)
      return thematicMapboxStyle(this.thematicMapType, this.opacity ?? 1).paint;
    switch (this.fillType) {
      case 'line':
      default:
        return {
          'line-color': this.layer === 'orgUnit' || this.layer === 'boundary'
            ? ['get', 'color'] : '#000000',
          'line-width': 1,
          'line-opacity': this.opacity ?? 1,
        };

      case 'fill':
        return {
          'fill-color': ['get', 'color'],
          'fill-opacity': 1,
        };

      case 'circle':
        return {
          'circle-radius': Number.isFinite(this.pointRadius) && this.pointRadius! >= 1 && this.pointRadius! <= 30
            ? this.pointRadius : 6,
          'circle-color': ['get', 'color'],
          'circle-opacity': this.opacity ?? 1,
          'circle-stroke-color': '#404b5a',
          'circle-stroke-width': 1,
        };
    }
  }

  get layout() {
    if (this.layer === 'thematic' && this.thematicMapType) return {};
    switch (this.fillType) {
      case 'line':
      default:
        return {};
      case 'circle':
        return {};
    }
  }

  get featureCollection(): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: this.features,
    };
  }

  #setFeatures() {
    if ((this.layer === 'thematic' && this.thematicMapType) ||
      (this.layer === 'thematic1' && this.method === 3)) {
      const fallbackColors = MapLayer.legacyEqualCountPalette;
      const fallbackScale = !this.colorScale && this.layer === 'thematic1' &&
        this.classes >= 1 && this.classes <= fallbackColors.length
        ? Array.from({ length: this.classes }, (_, index) =>
          fallbackColors[Math.round(index * (fallbackColors.length - 1) / Math.max(1, this.classes - 1))]).join(',')
        : this.colorScale;
      const result = buildThematic(joinThematicData(this.geoFeatures || [], this.data), {
        mode: this.thematicMapType || 'CHOROPLETH', method: this.method as 1 | 2 | 3 | 10,
        classes: this.classes, colorScale: fallbackScale, legendSet: this.legendSet,
        noDataColor: this.noDataColor, unclassifiedColor: this.unclassifiedColor,
        radiusLow: this.radiusLow, radiusHigh: this.radiusHigh, opacity: this.opacity,
      });
      this.features = result.features.features;
      this.legendSet = result.legendSet;
      this.missingGeometryIds = result.missingGeometry;
      return;
    }
    if (!this.legendSet) {
      this.legendSet = LegendSetUtil.generateFromColorScale(
        {
          method: this.method,
          colorScale: this.colorScale,
          classes: this.classes,
          noDataColor: this.noDataColor,
        },
        this.data
      );
    }

    this.features = (this.geoFeatures || [])
      .map((geoFeature) => {
        return GeoJSONUtil.getGeoJSON(
          geoFeature,
          this.data,
          this.legendSet,
          this.layer
        );
      })
      .filter((geoJSON): geoJSON is GeoJSON => Boolean(geoJSON))
      .map((geoJSON) => geoJSON.toObject()) as Feature[];
  }

  #setMapSourceData() {
    this.mapSourceData = {
      type: 'FeatureCollection',
      features: this.features,
    };
  }
}
