import * as turf from '@turf/turf';
import * as mapboxgl from 'mapbox-gl';

import { flatten, uniqBy } from 'lodash';
import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { MapLayer } from './layers/map-layer.model';
import { BaseMap, LegendControl } from './models';
import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';

export class MapVisualizer extends BaseVisualizer implements Visualizer {
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

  async loadLayers() {
    this.layers = await Promise.all(
      this.layers.map(async (layer: MapLayer) => {
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
        style: this.style,
        zoom: this.zoom,
        accessToken: this.accessToken,
      });

      this.map.fitBounds(bbox, { padding: 40 });
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.addControl(new MapboxStyleSwitcherControl());

      this.map.on('load', () => {
        this.layers.forEach((layer: MapLayer) => {
          this.map.addSource(layer.id, {
            type: layer.sourceType,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50),
            clusterProperties: {
              // Aggregate 'value' property for clusters
              sum: ['+', ['get', 'value']],
            },
            data: layer.featureCollection,
          });

          // TODO: Refactor this code, not all layers will respond to this logic
          const circleColors = flatten(
            (layer.legendSet?.legends || [])
              .sort((a, b) => a.startValue - b.startValue)
              .map((legend, index) =>
                index === 0 ? [legend.color] : [legend.startValue, legend.color]
              )
          );

          console.log(circleColors);

          if (layer.fillType !== 'line') {
            this.map.addLayer({
              id: 'clusters',
              type: 'circle',
              source: layer.id,
              filter: ['has', 'sum'],
              paint: {
                'circle-color': ['step', ['get', 'sum'], ...circleColors],
                'circle-radius': [
                  'step',
                  ['get', 'sum'],
                  20,
                  100,
                  30,
                  1000,
                  40,
                ],
              },
            });

            this.map.addLayer({
              id: `${layer.id}_clustered`,
              type: 'symbol',
              filter: ['has', 'sum'],
              source: layer.id,
              layout: {
                'text-field': ['get', 'sum'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
              },
            });
          }

          this.map.addLayer({
            id: layer.id,
            type: layer.fillType,
            filter: ['!', ['has', 'sum']],
            source: layer.id,
            paint: layer.paint,
            layout: {},
          });

          if (layer.fillType !== 'line') {
            this.map.addLayer({
              id: `${layer.id}_unclustered`,
              type: 'symbol',
              filter: ['!', ['has', 'sum']],
              source: layer.id,
              layout: {
                'text-field': ['get', 'value'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 10,
              },
            });
          }

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

          this.map.addControl(
            new LegendControl(legends, legendTitle),
            'bottom-right'
          );
        });
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

  override dispose(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
