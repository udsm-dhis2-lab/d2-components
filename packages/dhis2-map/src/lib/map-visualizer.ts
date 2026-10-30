import * as turf from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';
import { BaseVisualizer, Visualizer } from './core';
import { MapLayer } from './layers/map-layer.model';
import { MapLayerRegistry } from './layer-registry';
import { LegendControl } from './models/legend-control.model';
import { MapLayerConfiguration } from './models/map-layer-configuration.model';
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
  #loadListener?: () => void;
  #readyResolve?: () => void;
  #controls: ProviderControl[] = [];
  #loadedLayers: MapLayer[] = [];
  #generation = 0;
  #loadAbort?: AbortController;
  readonly layerRegistry = new MapLayerRegistry();

  constructor(
    private readonly provider: MapProviderAdapter = new DefaultMapProviderAdapter()
  ) {
    super();
    for (const kind of ['thematic', 'facility', 'boundary', 'orgUnit', 'legacy']) {
      this.layerRegistry.register({ kind,
        load: (layer, signal) => layer.loadFeatures(signal),
        render: (layer, map) => this.#renderLayer(layer, map) });
    }
  }
  setBaseMap(_basemap: unknown): D2Maps {
    return this;
  }
  setZoom(zoom: number): D2Maps {
    this.zoom = zoom;
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
    this.map = this.provider.createMap({
      container: this._id,
      style: this.mapLayerConfiguration.hideBasemap || !hasProviderStyle
        ? blankStyle : this.#providerConfig?.style,
      zoom: this.zoom,
      accessToken: this.#providerConfig?.accessToken,
    });
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
      this.#loadListener = () => {
        if (generation !== this.#generation) return resolve();
        try {
          this.#renderLayers(map);
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

  #renderLayers(map: ProviderMap): void {
    this.#loadedLayers
      .map((layer, index) => ({ layer, index }))
      .sort((a, b) => (a.layer.sortOrder ?? a.index) - (b.layer.sortOrder ?? b.index) || a.index - b.index)
      .forEach(({ layer }) => {
      if (layer.hidden) return;
      try {
        this.layerRegistry.resolve(this.#definitionKind(layer)).render(layer, map);
      } catch (error) {
        this.layerFailures.push({ layerId: layer.id, error });
      }
    });
  }

  #definitionKind(layer: MapLayer): string {
    // Preserve the old generic MapLayer path for historical facade payloads.
    return layer.layer && this.layerRegistry.has(layer.layer) ? layer.layer : 'legacy';
  }

  #renderLayer(layer: MapLayer, map: ProviderMap): void {
        const source = `${layer.id}-source`;
        map.addSource(source, {
          type: 'geojson',
          data: layer.featureCollection,
        });
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
          map.addLayer({ id: layer.id, type: layer.layer === 'facility' ? 'circle' : 'line', source,
            filter: layer.layer === 'facility' ? pointFilter : polygonFilter,
            paint: layer.paint, layout: {} });
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
            this.#addControl(new LegendControl(layer.legendSet.legends.map(legend => ({
              useBackgroundColor: true, backgroundColor: legend.color, label: legend.name,
            })), layer.legendSet.name || 'Map legend'), 'bottom-right');
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
          this.#addControl(
            new LegendControl(legends, layer.legendSet?.name || 'Legend'),
            'bottom-right'
          );
        }
  }

  override dispose(): void {
    this.#generation++;
    this.#loadAbort?.abort();
    this.#loadAbort = undefined;
    if (this.map && this.#loadListener)
      this.map.off('load', this.#loadListener);
    if (this.map) {
      this.#controls.forEach((control) => this.map?.removeControl?.(control));
      this.map.remove();
    }
    this.#controls = [];
    this.#readyResolve?.();
    this.#readyResolve = undefined;
    this.#loadListener = undefined;
    this.map = null;
  }
}

// Backwards-compatible class identity for existing consumers.
export { D2Maps as MapVisualizer };
