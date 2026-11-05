import * as turf from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';
import { BaseVisualizer, Visualizer } from './core';
import { MapLayer } from './layers/map-layer.model';
import { MapLayerRegistry } from './layer-registry';
import { LegendControl, LegendItem } from './models/legend-control.model';
import { MapLayerConfiguration } from './models/map-layer-configuration.model';
import { facilitySymbolUrl } from './geometry/facility-symbol';
import { clusterSizeForZoom } from './events/event-layer';
import { buildPeriodFrames, type PeriodFrame, type PeriodFrameRequest } from './period-frames';
import { ExternalSourceRegistry, type ExternalView } from './external-sources';
import type { MapBasemap, MapCoreVersion } from './saved-map-boundary';
import {
  DefaultMapProviderAdapter,
  MapProviderAdapter,
  MapProviderConfig,
  ProviderControl,
  ProviderMap,
} from './provider-adapter';

export interface MapLayerFailure {
  layerId: string;
  error: unknown;
}

export class D2Maps extends BaseVisualizer implements Visualizer {
  mapLayerConfiguration = new MapLayerConfiguration();
  layers: MapLayer[] = [];
  layerFailures: MapLayerFailure[] = [];
  zoom = 5;
  map: ProviderMap | null = null;
  #providerConfig?: MapProviderConfig;
  #moveListener?: () => void;
  #clusterAbort?: AbortController;
  #clusterRequest = 0;
  #loadListener?: () => void;
  #readyResolve?: () => void;
  #controls: ProviderControl[] = [];
  #resizeObserver?: ResizeObserver;
  #legendControl?: LegendControl;
  #loadedLayers: MapLayer[] = [];
  #generation = 0;
  #loadAbort?: AbortController;
  #periodFrames?: readonly PeriodFrame[];
  #periodBaseLayers?: readonly MapLayer[];
  #coreVersion: MapCoreVersion = '2.41.3';
  #basemap?: MapBasemap;
  #externalRegistry?: ExternalSourceRegistry;
  #externalViews: ExternalView[] = [];
  readonly layerRegistry = new MapLayerRegistry();

  constructor(
    private readonly provider: MapProviderAdapter = new DefaultMapProviderAdapter(),
    private readonly fetcher?: typeof fetch
  ) {
    super();
    for (const kind of ['thematic', 'facility', 'boundary', 'orgUnit', 'event', 'trackedEntity', 'legacy']) {
      this.layerRegistry.register({ kind,
        load: (layer, signal) => layer.loadFeatures(signal),
        render: (layer, map) => this.#renderLayer(layer, map) });
    }
  }
  setMapCoreVersion(version: MapCoreVersion): D2Maps {
    if (version !== '2.41.3' && version !== '2.43') throw new Error('Unsupported map Core version');
    this.#coreVersion = version;
    return this;
  }
  setBaseMap(input: unknown): D2Maps {
    if (input == null) return this;
    if (Array.isArray(input)) {
      if (this.#coreVersion !== '2.43') throw new Error('basemaps[] requires Core 2.43');
      if (input.length > 1) throw new Error('Multiple simultaneous basemaps are unsupported');
      input = input[0];
    }
    let value = input;
    if (typeof input === 'string') {
      if (input.trim().startsWith('{')) {
        try { value = JSON.parse(input); } catch { throw new Error('Invalid encoded basemap'); }
      } else value = {id:input};
    }
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
      typeof (value as MapBasemap).id !== 'string') throw new Error('Invalid basemap');
    const basemap = value as MapBasemap;
    if (basemap.opacity !== undefined && (!Number.isFinite(basemap.opacity) || basemap.opacity < 0 || basemap.opacity > 1))
      throw new Error('Invalid basemap opacity');
    if (basemap.hidden !== undefined && typeof basemap.hidden !== 'boolean') throw new Error('Invalid basemap hidden state');
    this.#basemap = basemap;
    return this;
  }
  setExternalSourceRegistry(registry: ExternalSourceRegistry): D2Maps {
    this.#externalRegistry = registry;
    return this;
  }
  addExternalView(config: unknown): D2Maps {
    if (!this.#externalRegistry) throw new Error('External source registry is required');
    this.#externalViews.push(this.#externalRegistry.parseView(config));
    return this;
  }
  setZoom(zoom: number): D2Maps {
    if (Number.isFinite(zoom) && zoom >= 0 && zoom <= 22) this.zoom = zoom;
    return this;
  }
  addLayer(layer: MapLayer): D2Maps {
    this.layers = [...this.layers, layer];
    return this;
  }
  setLayerConfig(config: MapLayerConfiguration): D2Maps {
    if (config) this.mapLayerConfiguration = config;
    return this;
  }
  setProviderConfig(config: MapProviderConfig): D2Maps {
    this.#providerConfig = config;
    return this;
  }

  /** Opt-in period plan. Existing draw() calls retain their original combined-period semantics. */
  configurePeriods(request: PeriodFrameRequest): D2Maps {
    const configured = new Set(this.layers.map(layer=>layer.id));
    if (request.layers.some(layer=>!configured.has(layer.id)))
      throw new Error('Period plan refers to an unconfigured map layer');
    this.#periodFrames = buildPeriodFrames(request);
    this.#periodBaseLayers = [...this.layers];
    return this;
  }

  get periodFrames(): readonly PeriodFrame[] { return this.#periodFrames || []; }

  async showPeriod(periodId: string): Promise<void> {
    const frame = this.#periodFrames?.find(item=>item.periodId===periodId);
    if (!frame || !this.#periodBaseLayers) throw new Error(`Unknown map period: ${periodId}`);
    const states = new Map(frame.layers.map(item=>[item.id,item.state]));
    this.layers = this.#periodBaseLayers.filter(layer=>states.get(layer.id)==='available')
      .map(layer=>layer.forPeriod(periodId));
    await this.draw();
  }

  async loadLayers(signal: AbortSignal = new AbortController().signal): Promise<MapLayer[]> {
    const configured = [...this.layers];
    const settled = await Promise.allSettled(
      configured.map(async (layer) => {
        layer.setBaseUrl(this._baseUrl);
        await this.layerRegistry.resolve(this.#definitionKind(layer)).load(layer, signal);
        return layer;
      })
    );
    if (signal.aborted) return [];
    this.layerFailures = settled.flatMap((result, index) =>
      result.status === 'rejected'
        ? [{ layerId: configured[index].id, error: result.reason }]
        : []
    );
    this.#loadedLayers = settled.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : []
    );
    return this.#loadedLayers;
  }

  getValidFeatures(features: readonly Feature[]): Feature[] {
    return features.filter((feature) => {
      if (!feature?.geometry) return false;
      if (feature.geometry.type !== 'Point') return true;
      const [, latitude] = feature.geometry.coordinates;
      return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
    });
  }

  getBounds(): [number, number, number, number] | null {
    const features = this.getValidFeatures(
      this.#loadedLayers.filter(layer => !layer.hidden)
        .flatMap((layer) => layer.featureCollection.features)
    );
    if (!features.length) return null;
    return turf.bbox({
      type: 'FeatureCollection',
      features,
    } as FeatureCollection) as [number, number, number, number];
  }

  async draw(): Promise<void> {
    this.dispose();
    const generation = this.#generation;
    const abort = new AbortController();
    this.#loadAbort = abort;
    await this.loadLayers(abort.signal);
    if (abort.signal.aborted || generation !== this.#generation) return;
    if (this.layers.length && !this.#loadedLayers.length && this.layerFailures.length)
      throw new Error(`Unable to load map layers: ${this.layerFailures.map(item => item.layerId).join(', ')}`);
    const blankStyle = { version: 8, sources: {}, layers: [] };
    const hasProviderStyle = Boolean(this.#providerConfig?.style);
    let style: string | Record<string, unknown> | undefined = this.#providerConfig?.style;
    const basemap = this.#basemap;
    if (basemap && this.#externalRegistry?.has(basemap.id) && !basemap.hidden) {
      const record = this.#externalRegistry.get(basemap.id);
      if (record.mapLayerPosition !== 'BASEMAP') throw new Error('External basemap source must be registered as BASEMAP');
      if (record.mapService === 'VECTOR_STYLE')
        style = await this.#externalRegistry.loadVectorStyle(record,this.fetcher ?? globalThis.fetch,abort.signal);
      else if (['WMS','XYZ','TMS'].includes(record.mapService))
        style = {version:8,sources:{basemap:this.#externalRegistry.rasterSource(record)},
          layers:[{id:'basemap',type:'raster',source:'basemap',paint:{'raster-opacity':basemap.opacity ?? 1}}]};
      else throw new Error('GeoJSON URL cannot be a basemap');
    }
    if (abort.signal.aborted || generation !== this.#generation) return;
    this.map = this.provider.createMap({
      container: this._id,
      style: this.mapLayerConfiguration.hideBasemap || basemap?.hidden || (!hasProviderStyle && !style)
        ? blankStyle : style,
      zoom: this.zoom,
      accessToken: this.#providerConfig?.accessToken,
    });
    if (typeof ResizeObserver !== 'undefined' && typeof document !== 'undefined' && this.map.resize) {
      const host = document.getElementById(this._id);
      if (host) {
        const map = this.map;
        this.#resizeObserver = new ResizeObserver(() => {
          if (this.map === map) map.resize?.();
        });
        this.#resizeObserver.observe(host);
      }
    }
    const bounds = this.getBounds();
    if (bounds) this.map.fitBounds(bounds, { padding: 40 });
    if (!this.mapLayerConfiguration.hideNavigationControls)
      this.#addControl(this.provider.createNavigationControl());
    if (hasProviderStyle && !this.mapLayerConfiguration.hideStyleSwitcher)
      this.#addControl(this.provider.createStyleSwitcherControl());
    await new Promise<void>((resolve, reject) => {
      const map = this.map;
      if (!map) return resolve();
      this.#readyResolve = resolve;
      this.#loadListener = async () => {
        if (generation !== this.#generation) return resolve();
        try {
          await this.#renderLayers(map);
          if (map.on && this.#loadedLayers.some(layer => layer.serverClustersLoaded)) {
            this.#moveListener = () => { void this.#refreshServerClusters(map); };
            map.on('moveend',this.#moveListener);
            await this.#refreshServerClusters(map);
          }
          this.#readyResolve = undefined;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      map.once('load', this.#loadListener);
    });
  }

  #addControl(control: ProviderControl, position?: string): void {
    this.#controls.push(control);
    this.map?.addControl(control, position);
  }

  #addLegend(legends: LegendItem[], title: string): void {
    if (!legends.length) return;
    if (this.#legendControl) this.#legendControl.addSection(legends, title);
    else {
      this.#legendControl = new LegendControl(legends, title);
      this.#addControl(this.#legendControl, 'top-left');
    }
  }

  async #refreshServerClusters(map: ProviderMap): Promise<void> {
    if (!map.getBounds || !map.getZoom || !map.getSource) return;
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const bbox = [bounds.getWest(),bounds.getSouth(),bounds.getEast(),bounds.getNorth()] as const;
    if (!bbox.every(Number.isFinite) || !Number.isFinite(zoom)) return;
    this.#clusterAbort?.abort();
    const abort = new AbortController();
    this.#clusterAbort = abort;
    const request = ++this.#clusterRequest;
    const viewport = {clusterSize:clusterSizeForZoom(zoom),bbox};
    await Promise.all(this.#loadedLayers.filter(layer => layer.serverClustersLoaded && !layer.hidden)
      .map(async layer => {
        try {
          const data = await layer.refreshEventClusters(viewport,abort.signal);
          if (abort.signal.aborted || this.map !== map || request !== this.#clusterRequest) return;
          await map.getSource?.(`${layer.id}-source`)?.setData(data);
        } catch (error) {
          if (!abort.signal.aborted && this.map === map)
            this.layerFailures.push({layerId:layer.id,error});
        }
      }));
  }

  async #renderLayers(map: ProviderMap): Promise<void> {
    const entries = [
      ...this.#loadedLayers.map((layer,index)=>({layer,index,order:layer.sortOrder ?? index})),
      ...this.#externalViews.map((view,index)=>({view,index:index+this.#loadedLayers.length,
        order:view.sortOrder ?? index+this.#loadedLayers.length})),
    ].sort((a,b)=>a.order-b.order || a.index-b.index);
    for (const entry of entries
    ) {
      if (this.map !== map) return;
      if ('view' in entry) {
        if (!entry.view.hidden) await this.#renderExternalView(entry.view,map);
        continue;
      }
      const {layer} = entry;
      if (layer.hidden) continue;
      try {
        await this.layerRegistry.resolve(this.#definitionKind(layer)).render(layer, map);
      } catch (error) {
        this.layerFailures.push({ layerId: layer.id, error });
      }
    }
  }

  async #renderExternalView(view: ExternalView, map: ProviderMap): Promise<void> {
    const registry = this.#externalRegistry;
    if (!registry) throw new Error('External source registry is required');
    const record = registry.get(view.sourceId);
    if (record.mapLayerPosition !== 'OVERLAY') throw new Error('External view must reference an OVERLAY source');
    const sourceId = `external-${view.id}`;
    if (record.mapService === 'VECTOR_STYLE') throw new Error('Vector styles are supported as basemaps only');
    if (record.mapService === 'GEOJSON_URL') {
      const data = await registry.loadGeoJSON(record,this.fetcher ?? globalThis.fetch,this.#loadAbort?.signal);
      if (this.map !== map || this.#loadAbort?.signal.aborted) return;
      map.addSource(sourceId,{type:'geojson',data,attribution:record.attribution});
      for (const [type,geometry] of [['fill','Polygon'],['line','LineString'],['circle','Point']] as const)
        map.addLayer({id:`${sourceId}-${type}`,source:sourceId,type,filter:['==',['geometry-type'],geometry],
          paint:type === 'fill' ? {'fill-color':view.color || '#66c2a5','fill-opacity':view.opacity ?? 1} :
            type === 'line' ? {'line-color':view.color || '#006d2c','line-opacity':view.opacity ?? 1} :
              {'circle-color':view.color || '#66c2a5','circle-opacity':view.opacity ?? 1,'circle-radius':6}});
      return;
    }
    map.addSource(sourceId,registry.rasterSource(record));
    map.addLayer({id:sourceId,type:'raster',source:sourceId,
      paint:{'raster-opacity':view.opacity ?? 1}});
  }

  #definitionKind(layer: MapLayer): string {
    // Preserve the old generic MapLayer path for historical facade payloads.
    return layer.layer && this.layerRegistry.has(layer.layer) ? layer.layer : 'legacy';
  }

  async #renderLayer(layer: MapLayer, map: ProviderMap): Promise<void> {
        const source = `${layer.id}-source`;
        const icons = layer.layer === 'facility' ? await this.#loadFacilitySymbols(layer, map) : [];
        if (this.map !== map) return;
        map.addSource(source, {
          type: 'geojson',
          data: layer.featureCollection,
          ...(layer.layer === 'event' && layer.eventClustering && !layer.serverClustersLoaded ? {
            cluster: true, clusterRadius: 50, clusterMaxZoom: 12,
          } : {}),
        });
        if (layer.layer === 'trackedEntity') {
          map.addLayer({id:layer.id,type:'circle',source,
            paint:{'circle-color':['get','color'],
              'circle-radius':Number.isFinite(layer.eventPointRadius) && layer.eventPointRadius >= 1 && layer.eventPointRadius <= 30
                ? layer.eventPointRadius : 6,
              'circle-opacity':layer.opacity ?? 1,
              'circle-stroke-color':'#ffffff','circle-stroke-width':1}});
          if (!this.mapLayerConfiguration.hideLegendControl && layer.legendSet?.legends?.length)
            this.#addLegend(layer.legendSet.legends.map(legend=>({useBackgroundColor:true,
              backgroundColor:legend.color,label:legend.name})),layer.legendSet.name);
          return;
        }
        if (layer.layer === 'event') {
          const savedColor = layer.eventPointColor;
          const eventColor = typeof savedColor === 'string' && /^#?[0-9a-fA-F]{6}$/.test(savedColor)
            ? `#${savedColor.replace(/^#/, '')}` : '#333333';
          const entries = Object.entries(layer.eventCategoryColors || {});
          if (entries.some(([key, value]) => !key || key.length > 100 || !/^#[0-9a-fA-F]{6}$/.test(value)))
            throw new Error(`Invalid event category colours for map layer "${layer.id}"`);
          const color = entries.length ? ['match', ['get','category'],
            ...entries.flatMap(([category, value]) => [category, value]), eventColor] : eventColor;
          if (layer.eventClustering) {
            map.addLayer({id: `${layer.id}-clusters`, type:'circle', source,
              filter:['has','point_count'], paint:{'circle-color':eventColor,
                'circle-radius':['step',['get','point_count'],14,100,18,1000,23,10000,29],
                'circle-pitch-alignment':'viewport','circle-pitch-scale':'viewport',
                'circle-opacity':layer.opacity ?? 1,
                'circle-stroke-color':'#ffffff','circle-stroke-width':1}});
            map.addLayer({id:`${layer.id}-counts`, type:'symbol', source,
              filter:['has','point_count'], layout:{'text-field':['get','point_count_abbreviated'],
                'text-size':12}, paint:{'text-color':'#ffffff'}});
          }
          if (!layer.serverClustersLoaded)
            map.addLayer({id:layer.id, type:'circle', source,
              filter:layer.eventClustering ? ['!', ['has','point_count']] : undefined,
              paint:{'circle-color':color,
                'circle-radius': Number.isFinite(layer.eventPointRadius) && layer.eventPointRadius >= 1 && layer.eventPointRadius <= 30
                  ? layer.eventPointRadius : 6,
                'circle-opacity':layer.opacity ?? 1,
                'circle-stroke-color':'#ffffff','circle-stroke-width':1}});
          return;
        }
        if (layer.layer === 'facility' || layer.layer === 'orgUnit' || layer.layer === 'boundary') {
          const polygonFilter = ['==', ['geometry-type'], 'Polygon'];
          const pointFilter = ['==', ['geometry-type'], 'Point'];
          if (layer.layer === 'facility' && layer.features.some(feature =>
            feature.properties?.['geometryKind'] === 'straight-line-buffer'))
            map.addLayer({ id: `${layer.id}-buffer`, type: 'fill', source,
              filter: ['==', ['get', 'geometryKind'], 'straight-line-buffer'],
              paint: { 'fill-color': ['get', 'color'], 'fill-opacity': Math.min(0.25, layer.opacity ?? 1) } });
          if (layer.layer === 'facility' && layer.features.some(feature =>
            feature.properties?.['geometryKind'] === 'associated-geometry'))
            map.addLayer({ id: `${layer.id}-associated`, type: 'fill', source,
              filter: ['==', ['get', 'geometryKind'], 'associated-geometry'],
              paint: { 'fill-color': ['get', 'color'], 'fill-opacity': Math.min(0.3, layer.opacity ?? 1) } });
          const iconGroupIds = icons.map(icon => icon.groupId);
          map.addLayer({ id: layer.id, type: layer.layer === 'facility' ? 'circle' : 'line', source,
            filter: layer.layer === 'facility' && icons.length
              ? ['all', pointFilter, ['!', ['in', ['get', 'groupId'], ['literal', iconGroupIds]]]]
              : layer.layer === 'facility' ? pointFilter : polygonFilter,
            paint: layer.paint, layout: {} });
          if (icons.length)
            map.addLayer({ id: `${layer.id}-icons`, type: 'symbol', source,
              filter: ['all', pointFilter, ['in', ['get', 'groupId'], ['literal', iconGroupIds]]],
              layout: { 'icon-image': ['match', ['get', 'groupId'],
                ...icons.flatMap(icon => [icon.groupId, icon.imageId]), ''],
                'icon-allow-overlap': true } });
          if (layer.layer !== 'facility' && layer.features.some(feature => feature.geometry.type === 'Point'))
            map.addLayer({ id: `${layer.id}-points`, type: 'circle', source,
              filter: pointFilter, paint: { 'circle-color': ['get', 'color'],
                'circle-radius': 5, 'circle-opacity': layer.opacity ?? 1 } });
          if (layer.labels && this.#providerConfig?.style && !this.mapLayerConfiguration.hideBasemap)
            map.addLayer({ id: `${layer.id}-labels`, type: 'symbol', source,
              filter: layer.layer === 'facility' ? pointFilter : polygonFilter,
              layout: { 'text-field': ['get', 'name'], 'text-size': 11 },
              paint: { 'text-color': '#404b5a', 'text-halo-color': '#ffffff', 'text-halo-width': 1 } });
          if (!this.mapLayerConfiguration.hideLegendControl && layer.legendSet?.legends?.length)
            this.#addLegend(layer.legendSet.legends.map(legend => ({
              useBackgroundColor: !icons.some(icon => icon.groupId === legend.id),
              backgroundColor: legend.color,
              symbol: icons.find(icon => icon.groupId === legend.id)?.url,
              label: legend.name,
            })), layer.legendSet.name || 'Map legend');
          return;
        }
        map.addLayer({
          id: layer.id,
          type: layer.fillType,
          source,
          paint: layer.paint,
          layout: layer.layout,
        });
        if (layer.fillType === 'fill') {
          map.addLayer({
            id: `${layer.id}-boundary`,
            type: 'line',
            source,
            paint: { 'line-color': '#000000', 'line-width': 1 },
            layout: { 'line-join': 'round', 'line-cap': 'round' },
          });
          // A blank style has no glyph source; skip labels until a provider
          // supplies a compatible style with fonts.
          if (this.#providerConfig?.style && !this.mapLayerConfiguration.hideBasemap)
            map.addLayer({
              id: `${layer.id}-symbol`,
              type: 'symbol',
              source,
              layout: {
                'text-field': ['get', 'name'],
                'text-size': 11,
                'text-anchor': 'center',
              },
              paint: {
                'text-color': '#000000',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2,
              },
            });
        }
        if (!this.mapLayerConfiguration.hideLegendControl) {
          const legends = (layer.legendSet?.legends || []).map((legend) => ({
            useBackgroundColor: true,
            backgroundColor: legend.color,
            label: `${legend.name} (${legend.startValue} - ${legend.endValue})`,
          }));
          this.#addLegend(legends, layer.legendSet?.name || 'Legend');
        }
  }

  async #loadFacilitySymbols(layer: MapLayer, map: ProviderMap): Promise<{ groupId: string; imageId: string; url: string }[]> {
    if (!map.loadImage || !map.addImage) return [];
    const used = new Set(layer.features.filter(feature => feature.geometry.type === 'Point')
      .map(feature => feature.properties?.['groupId']).filter((id): id is string => typeof id === 'string' && Boolean(id)));
    const loaded = await Promise.all(layer.facilityGroups.filter(group => used.has(group.id)).map(async group => {
      const url = facilitySymbolUrl(group.symbol, layer.baseUrl, layer.symbolBaseUrl);
      if (!url) return null;
      const imageId = `${layer.id}-group-${group.id}`;
      try {
        const image = await map.loadImage!(url);
        if (this.map !== map) return null;
        if (!map.hasImage?.(imageId)) map.addImage!(imageId, image.data);
        return { groupId: group.id, imageId, url };
      } catch { return null; }
    }));
    return loaded.filter((item): item is NonNullable<typeof item> => item !== null);
  }

  override dispose(): void {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    this.#generation++;
    this.#clusterRequest++;
    this.#clusterAbort?.abort();
    this.#clusterAbort = undefined;
    this.#loadAbort?.abort();
    this.#loadAbort = undefined;
    if (this.map && this.#loadListener)
      this.map.off('load', this.#loadListener);
    if (this.map && this.#moveListener)
      this.map.off('moveend',this.#moveListener);
    if (this.map) {
      this.#controls.forEach((control) => this.map?.removeControl?.(control));
      this.map.remove();
    }
    this.#controls = [];
    this.#legendControl = undefined;
    this.#readyResolve?.();
    this.#readyResolve = undefined;
    this.#loadListener = undefined;
    this.#moveListener = undefined;
    this.map = null;
  }
}

// Backwards-compatible class identity for existing consumers.
export { D2Maps as MapVisualizer };
