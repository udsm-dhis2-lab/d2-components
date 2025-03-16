import { AnalyticsResult } from '@iapps/function-analytics';
import { LegendSet, VisualizationData } from '../../../shared/models';
import {
  DigitGroupSeparator,
  GeoJSON,
  MapLayerType,
  MapRenderingStrategy,
  TitleOption,
} from '../models';
import { MapGeoFeature } from '../models/map-geo-feature.model';
import { GeoJSONUtil, LegendSetUtil } from '../utils';

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
  method!: number;
  classes!: number;
  colorScale!: string;
  noDataColor!: string;
  legendSet!: LegendSet;
  dataSelections!: any[];
  geoFeatures!: MapGeoFeature[];
  features!: GeoJSON[];
  data!: AnalyticsResult;
  mapSourceData!: any;
  fillType!: 'fill' | 'line' | 'circle';
  sourceType = 'geojson';
  baseUrl = '../../..';
  [x: string]: any;

  constructor(props?: Partial<MapLayer>) {
    if (props) {
      Object.keys(props).forEach((key) => {
        this[key] = props[key];
      });
    }
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

  setDataSelections(dataSelections: any): MapLayer {
    this.dataSelections = dataSelections;
    return this;
  }

  setBaseUrl(baseUrl: string): MapLayer {
    this.baseUrl = baseUrl;
    return this;
  }

  async loadFeatures() {
    this.geoFeatures = await new MapGeoFeature()
      .setDataSelections(this.dataSelections)
      .get(this.baseUrl);

    this.data = await new VisualizationData()
      .setSelections(this.dataSelections)
      .getAnalytics();

    this.#setFeatures();
    this.#setMapSourceData();
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
          'fill-opacity': 1,
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

  #setFeatures() {
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
      .filter((geoJSON) => geoJSON) as GeoJSON[];
  }

  #setMapSourceData() {
    this.mapSourceData = {
      type: 'FeatureCollection',
      features: this.features,
    };
  }
}
