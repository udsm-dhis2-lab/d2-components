import type {
  MapAnalytics,
  MapDataSource,
  MapSelection,
} from '../map-data-source';
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
  dataSelections!: MapSelection[];
  geoFeatures!: MapGeoFeature[];
  features!: Feature[];
  data!: MapAnalytics;
  mapSourceData!: FeatureCollection;
  fillType!: 'fill' | 'line' | 'circle';
  sourceType = 'geojson';
  baseUrl = '../../..';
  constructor(props?: Partial<MapLayer>, private dataSource?: MapDataSource) {
    if (props) Object.assign(this, props);
  }

  setDataSource(dataSource: MapDataSource): MapLayer {
    this.dataSource = dataSource;
    return this;
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

  async loadFeatures() {
    if (!this.dataSource)
      throw new Error(`No data source configured for map layer "${this.id}"`);
    const [geoFeatures, data] = await Promise.all([
      this.dataSource.loadGeoFeatures(this.dataSelections || [], this.baseUrl),
      this.dataSource.loadAnalytics(this.dataSelections || []),
    ]);
    this.geoFeatures = geoFeatures;
    this.data = data || { rows: [] };

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

  get featureCollection(): FeatureCollection {
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
