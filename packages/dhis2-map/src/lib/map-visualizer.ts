import * as turf from '@turf/turf';
import type { Feature, FeatureCollection } from 'geojson';
import { BaseVisualizer, Visualizer } from './core';
import { MapLayer } from './layers/map-layer.model';
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

export class MapVisualizer extends BaseVisualizer implements Visualizer {
  mapLayerConfiguration = new MapLayerConfiguration();
  layers: MapLayer[] = [];
  layerFailures: MapLayerFailure[] = [];
  zoom = 5;
  map: ProviderMap | null = null;
  #providerConfig?: MapProviderConfig;
  #loadListener?: () => void;
  #readyResolve?: () => void;
  #controls: ProviderControl[] = [];

  constructor(
    private readonly provider: MapProviderAdapter = new DefaultMapProviderAdapter()
  ) {
    super();
  }
  setBaseMap(_basemap: unknown): MapVisualizer {
    return this;
  }
  setZoom(zoom: number): MapVisualizer {
    this.zoom = zoom;
    return this;
  }
  addLayer(layer: MapLayer): MapVisualizer {
    this.layers = [...this.layers, layer];
    return this;
  }
  setLayerConfig(config: MapLayerConfiguration): MapVisualizer {
    if (config) this.mapLayerConfiguration = config;
    return this;
  }
  setProviderConfig(config: MapProviderConfig): MapVisualizer {
    this.#providerConfig = config;
    return this;
  }

  async loadLayers(): Promise<MapLayer[]> {
    const settled = await Promise.allSettled(
      this.layers.map(async (layer) => {
        layer.setBaseUrl(this._baseUrl);
        await layer.loadFeatures();
        return layer;
      })
    );
    this.layerFailures = settled.flatMap((result, index) =>
      result.status === 'rejected'
        ? [{ layerId: this.layers[index].id, error: result.reason }]
        : []
    );
    this.layers = settled.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : []
    );
    return this.layers;
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
      this.layers.flatMap((layer) => layer.featureCollection.features)
    );
    if (!features.length) return null;
    return turf.bbox({
      type: 'FeatureCollection',
      features,
    } as FeatureCollection) as [number, number, number, number];
  }

  async draw(): Promise<void> {
    this.dispose();
    await this.loadLayers();
    if (
      !this.mapLayerConfiguration.hideBasemap &&
      !this.#providerConfig?.style
    ) {
      throw new Error('Map provider configuration with a style is required');
    }
    this.map = this.provider.createMap({
      container: this._id,
      style: this.mapLayerConfiguration.hideBasemap
        ? { version: 8, sources: {}, layers: [] }
        : this.#providerConfig?.style,
      zoom: this.zoom,
      accessToken: this.#providerConfig?.accessToken,
    });
    const bounds = this.getBounds();
    if (bounds) this.map.fitBounds(bounds, { padding: 40 });
    if (!this.mapLayerConfiguration.hideNavigationControls)
      this.#addControl(this.provider.createNavigationControl());
    if (!this.mapLayerConfiguration.hideStyleSwitcher)
      this.#addControl(this.provider.createStyleSwitcherControl());
    await new Promise<void>((resolve, reject) => {
      const map = this.map;
      if (!map) return resolve();
      this.#readyResolve = resolve;
      this.#loadListener = () => {
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
    this.layers.forEach((layer) => {
      try {
        const source = `${layer.id}-source`;
        map.addSource(source, {
          type: 'geojson',
          data: layer.featureCollection,
        });
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
      } catch (error) {
        this.layerFailures.push({ layerId: layer.id, error });
      }
    });
  }

  override dispose(): void {
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
