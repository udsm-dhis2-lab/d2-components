import { GeoJSONUtil, MapGeometryUtil } from '../utils';
import { VisualizationData, LegendSet } from '../../../shared/models';
import {
  DigitGroupSeparator,
  MapLayerType,
  MapRenderingStrategy,
  TitleOption,
  GeoJSON,
} from '../models';
import { GeoFeature } from '../models/geo-feature.model';
import { MapGeometry } from '../models/geometry.model';
import { MapGeoFeature } from '../models/map-geo-feature.model';

export class MapLayer {
  id!: string;
  name!: string;
  program!: string;
  layer!: MapLayerType;
  renderingStrategy!: MapRenderingStrategy;
  sortOrder!: number;
  eventClustering!: boolean;
  opacity!: number;
  eventPointRadius!: number;
  hideSubtitle!: boolean;
  digitGroupSeparator!: DigitGroupSeparator;
  titleOption!: TitleOption;
  subtitleOption!: TitleOption;
  legendSet!: LegendSet;
  dataSelections!: any[];
  geoFeatures!: MapGeoFeature[];
  features!: GeoJSON[];
  data!: any;
  mapSourceData!: any;
  fillType!: 'fill' | 'line' | 'circle';
  sourceType = 'geojson';

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

  setFillType(fillType?: any) {
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

  setDataSelections(dataSelections: any): any {
    this.dataSelections = dataSelections;
    return this;
  }

  // setFeatures(features: GeoJSON[]): MapLayer {
  //   this.features = features;
  //   return this;
  // }

  async loadFeatures() {
    this.geoFeatures = await new MapGeoFeature()
      .setDataSelections(this.dataSelections)
      .get();

    this.data = await new VisualizationData()
      .setSelections(this.dataSelections)
      .getAnalytics();

    this.setMapSourceData();
    this.features = (this.geoFeatures || [])
      .map((geoFeature) => {
        return GeoJSONUtil.getGeoJSON(
          geoFeature,
          this.data,
          this.legendSet,
          this.layer
        );
      })
      .filter((geoJSON) => geoJSON) as GeoJSON[];
    this.setFillType();
  }

  get paint() {
    switch (this.fillType) {
      case 'line':
      default:
        return {
          'line-color': '#000000',
          'line-width': 1,
        };

      case 'fill':
        return {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.75,
        };

      case 'circle': {
        const pain = {
          // TODO: This is for thematics
          // 'circle-radius': ['/', ['get', 'value'], 10],
          // 'circle-color': ['get', 'color'],
          // TODO: This is for cluster
          'circle-color': [
            'step',
            ['get', 'sum'],
            '#51bbd6',
            100,
            '#f1f075',
            1000,
            '#f28cb1',
          ],
          'circle-radius': ['step', ['get', 'sum'], 20, 100, 30, 1000, 40],
        };

        return {
          'circle-radius': ['step', ['get', 'value'], 20, 100, 30, 750, 40],
          'circle-color': ['get', 'color'],
        };
      }
    }
  }

  get layout() {
    switch (this.fillType) {
      case 'line':
      default:
        return {};
      case 'circle':
        return {
          'text-field': '{sum}',
        };
    }
  }

  get featureCollection(): { type: 'FeatureCollection'; features: GeoJSON[] } {
    return {
      type: 'FeatureCollection',
      features: this.features,
    };
  }

  setMapSourceData() {
    this.mapSourceData = {
      type: 'FeatureCollection',
      features: (this.geoFeatures || []).map((geoFeature) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: JSON.parse(geoFeature.co),
          },
        };
      }),
    };
  }
}
