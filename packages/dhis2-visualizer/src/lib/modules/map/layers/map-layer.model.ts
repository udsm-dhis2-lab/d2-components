import { VisualizationData } from '../../../shared/models';
import {
  DigitGroupSeparator,
  LegendSet,
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

  setSubTitleOption(subtitleOption: TitleOption) {
    this.subtitleOption = subtitleOption;
    return this;
  }

  setType(type: MapLayerType) {
    this.layer = type;
    return this;
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

  setFeatures(features: GeoJSON[]): MapLayer {
    this.features = features;
    return this;
  }

  async getGeoFeatures() {
    this.geoFeatures = await new MapGeoFeature()
      .setDataSelections(this.dataSelections)
      .get();

    this.setMapSourceData();
    this.features = (this.geoFeatures || []).map((geoFeature) => {
      return new GeoJSON()
        .setType('Feature')
        .setGeometry(
          new MapGeometry()
            .setType('Polygon')
            .setCoordinates(JSON.parse(geoFeature.co))
        );
    });
    return this.geoFeatures;
  }

  async getData() {
    this.data = (
      await new VisualizationData()
        .setSelections(this.dataSelections)
        .getAnalytics()
    )?._data;
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
