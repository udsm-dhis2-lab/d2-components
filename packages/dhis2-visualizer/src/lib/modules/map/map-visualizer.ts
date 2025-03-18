import * as turf from '@turf/turf';
import * as mapboxgl from 'mapbox-gl';

import { flatten } from 'lodash';
import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';
import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { MapLayer } from './layers/map-layer.model';
import { BaseMap, LegendControl, MapLayerConfiguration } from './models';

export class MapVisualizer extends BaseVisualizer implements Visualizer {
  mapLayerConfiguration: MapLayerConfiguration = new MapLayerConfiguration();
  basemap!: BaseMap;
  layers: MapLayer[] = [];
  zoom = 5;
  map!: any;

  style =
    'https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json?key=CH1cYDfxBV9ZBu1lHGqh';
  source: any;
  accessToken =
    'pk.eyJ1IjoiaWJyYWhpbXdpY2thbWEiLCJhIjoiY2txM3Y2bXJ1MTJoZjJ2cXI1ZW9pdGg2biJ9.RZjlqK5FxQkQuFrh5lZm_g';

  constructor() {
    super();
  }

  setBaseMap(basemap: BaseMap): MapVisualizer {
    this.basemap = basemap;
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

  setLayerConfig(mapLayerConfig: MapLayerConfiguration): MapVisualizer {
    if (mapLayerConfig) {
      this.mapLayerConfiguration = mapLayerConfig;
    }
    return this;
  }

  async loadLayers() {
    this.layers = await Promise.all(
      this.layers.map(async (layer: MapLayer) => {
        layer.setBaseUrl(this._baseUrl);
        await layer.loadFeatures();
        return layer;
      })
    );
  }

  getValidFeatures(features: any[]) {
    return features.filter(
      (feature) =>
        (feature?.geometry?.coordinates || [])[1] >= -90 &&
        (feature?.geometry?.coordinates || [])[1] <= 90
    );
  }

  async draw() {
    await this.loadLayers();

    if (this.layers?.length > 0) {
      const isPointGeometry = (
        this.layers[0].featureCollection?.features || []
      ).some((feature) => feature.geometry.type === 'Point');

      const featureCollection = isPointGeometry
        ? turf.featureCollection(
            this.getValidFeatures(
              this.layers[0].featureCollection?.features || []
            )
          )
        : this.layers[0].featureCollection;

      const bbox = turf.bbox(featureCollection);

      this.map = new mapboxgl.Map({
        container: this._id,
        style: this.mapLayerConfiguration.hideBasemap
          ? {
              version: 8,
              sources: {},
              layers: [],
              glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
            }
          : this.style,
        zoom: this.zoom,
        accessToken: this.accessToken,
      });

      this.map.fitBounds(bbox, { padding: 40 });
      if (!this.mapLayerConfiguration.hideNavigationControls) {
        this.map.addControl(new mapboxgl.NavigationControl());
      }

      if (!this.mapLayerConfiguration.hideStyleSwitcher) {
        this.map.addControl(new MapboxStyleSwitcherControl());
      }

      this.map.on('load', () => {
        setTimeout(() => {
          this.layers.forEach((layer: MapLayer) => {
            /**
             * Add data source to the map
             */
            // this.map.addSource(layer.id, {
            //   type: layer.sourceType,
            //   cluster: layer.sourceType === 'geojson',
            //   clusterMaxZoom: 14,
            //   clusterRadius: 50,
            //   clusterProperties: {
            //     sum: ['+', ['get', 'value']],
            //   },
            //   data: layer.featureCollection,
            // });

            this.map.addSource(`${layer.id}-source`, {
              type: layer.sourceType,
              data: layer.featureCollection,
            });

            console.log('FEATURE', layer.featureCollection);

            switch (layer.fillType) {
              case 'line': {
                this.map.addLayer({
                  id: layer.id,
                  type: layer.fillType,
                  source: `${layer.id}-source`,
                  paint: layer.paint,
                  layout: {},
                });
                break;
              }

              case 'fill': {
                const fillColors = this.#getFillColors(layer);

                /**
                 * Set layer to present the actual data
                 */
                this.map.addLayer({
                  id: layer.id,
                  type: layer.fillType,
                  source: `${layer.id}-source`,
                  paint: layer.paint,
                  layout: {},
                });

                /**
                 * Set boundary layer to property show the boundaries around data
                 */
                this.map.addLayer({
                  id: `${layer.id}-boundary`,
                  type: 'line',
                  source: `${layer.id}-source`,
                  paint: {
                    'line-color': '#000000',
                    'line-width': 1,
                  },
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                  },
                });

                /**
                 * Set symbol layer to show labels on map data
                 */
                this.map.addLayer({
                  id: `${layer.id}-symbol`,
                  type: 'symbol',
                  source: `${layer.id}-source`,

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

                break;
              }

              default:
                break;
            }

            // TODO: Refactor this code, not all layers will respond to this logic
            // const circleColors = this.getCircleColors(layer);

            // if (layer.fillType !== 'line') {
            //   this.map.addLayer({
            //     id: 'clusters',
            //     type: 'circle',
            //     source: layer.id,
            //     filter: ['has', 'sum'],
            //     paint: {
            //       'circle-color': ['step', ['get', 'sum'], ...circleColors],
            //       'circle-radius': [
            //         'step',
            //         ['get', 'sum'],
            //         20,
            //         100,
            //         30,
            //         1000,
            //         40,
            //       ],
            //     },
            //   });

            // }

            // if (layer.fillType !== 'line') {
            //   this.map.addLayer({
            //     id: `${layer.id}_unclustered`,
            //     type: 'symbol',
            //     filter: ['!', ['has', 'sum']],
            //     source: layer.id,
            //     layout: {
            //       'text-field': ['get', 'value'],
            //       'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            //       'text-size': 10,
            //     },
            //   });
            // }

            // Add legend control
            const legendTitle = layer.legendSet?.name;

            const legends = (layer.legendSet?.legends || [])
              .map((legend) => {
                return {
                  useBackgroundColor: true,
                  backgroundColor: legend.color,
                  label: `${legend.name} (${legend.startValue} - ${legend.endValue})`,
                };
              })
              .filter((legend) => legend.label);

            if (!this.mapLayerConfiguration.hideLegendControl) {
              this.map.addControl(
                new LegendControl(legends, legendTitle || 'Legend'),
                'bottom-right'
              );
            }
          });
        }, 1000);
      });

      // new MapUtil()
      //   .setMapAnalytics(data as MapAnalytics)
      //   .setGeofeature(this.geoFeatures as any)
      //   .setLegendSet(this.legendSets)
      //   .setMapDashboardItem(this.config.config)
      //   .setMapDashboardExtensionItem(this.mapDashboardExtensionItem)
      //   .setContainer(this._id)
      //   .setStyle(this.layerStyle)
      //   .setShowLegend(this.d2VisualizerMapControl?.showMapLegend)
      //   .setShowLabel(this.d2VisualizerMapControl?.showMapLabel)
      //   .setShowValue(this.d2VisualizerMapControl?.showMapValue)
      //   .setShowMapTitle(this.d2VisualizerMapControl?.showMapTitle)
      //   .setShowBoundary(this.d2VisualizerMapControl?.showMapBoundary)
      //   .setShowMapSummary(this.d2VisualizerMapControl?.showMapSummary)
      //   .draw();
    }
  }

  #getFillColors(layer: MapLayer) {
    // ['#BD0026', 30, '#F03B20', 50, '#FD8D3C', 70, '#FEB24C', 80, '#FED976', 90, '#FFFFB2', 120, '#CCCCCC']
    return (
      flatten(
        (layer.legendSet?.legends || [])
          .sort((a, b) => a.startValue - b.startValue)
          .map((legend, index) =>
            index === 0 ? [legend.color] : [legend.startValue, legend.color]
          )
      ) || ['#FF0000', 30, '#00FF00', 60, '#0000FF']
    );
  }

  override dispose(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
