import { Fn } from '@iapps/function-analytics';
import * as _ from 'lodash';
import { ChartVisualizer } from './modules/chart/chart-visualizer';
import { CustomVisualizer } from './modules/custom/custom-visualizer';
import { MapLayer } from './modules/map/layers/map-layer.model';
import { TrackedEntityLayer } from './modules/map/layers/tracked-entity-layer.model';
import { MapVisualizer } from './modules/map/map-visualizer';
import { LegendSet } from './modules/map/models/legend-set.model';
import { D2VisualizerMapControl } from './modules/map/models/map-control.model';
import { MapDashboardExtensionItem } from './modules/map/models/map-dashboard-extension.model';
import { MapDashboardItem } from './modules/map/models/map-dashboard-item.model';
import { SingleValueVisualizer } from './modules/single-value/single-value-visualizer';
import { TableAnalytics } from './modules/table/models/table-analytics.model';
import { TableConfiguration } from './modules/table/models/table-config.model';
import { TableDashboardItem } from './modules/table/models/table-dashboard-item.model';
import { TableUtil } from './modules/table/utils/table.util';
import { getSelectionDimensionsFromFavorite } from './shared/helpers';
import { Visualizer, VisualizerPlotOptions } from './shared/models';
import { VisualizationConfiguration } from './shared/models/visualization-configuration.model';
import {
  ChartType,
  VisualizationType,
} from './shared/models/visualization-type.model';

export class D2Visualizer {
  dataSelections!: any[];
  type!: VisualizationType;
  visualizationType!: VisualizationType;
  config!: VisualizationConfiguration;
  chartType!: any;
  id!: string;
  d2VisualizerMapControl: D2VisualizerMapControl | any;
  legendSets: LegendSet[] | any = null;
  mapDashboardItem: MapDashboardItem | any;
  mapDashboardExtensionItem: MapDashboardExtensionItem | any;
  geoFeatures: any[] = [];
  dataAnalytics: unknown = null;
  layerStyle = 'default';
  trackedEntityInstances?: any[];
  program: any;
  data!: any;
  visualizer!: Visualizer;
  plotOptions!: VisualizerPlotOptions;

  // Table Configuration
  tableDashboardItem: TableDashboardItem | any;
  tableAnalytics: TableAnalytics | any;
  tableConfiguration: TableConfiguration | any;
  tableLegendSets: LegendSet[] | any;

  /**
   *
   * @param tableDashboardItem
   * @returns
   */
  setTableDashboardItem(tableDashboardItem: TableDashboardItem) {
    this.tableDashboardItem = tableDashboardItem;
    return this;
  }

  /**
   *
   * @returns
   */
  getTableDashboardItem(): TableDashboardItem {
    return this.tableDashboardItem;
  }

  /**
   *
   * @param tableAnalytics
   * @returns
   */
  setTableAnalytics(tableAnalytics: TableAnalytics) {
    this.tableAnalytics = tableAnalytics;
    return this;
  }

  /**
   *
   * @returns
   */
  getTableAnalytics(): TableAnalytics {
    return this.tableAnalytics;
  }

  /**
   *
   * @param tableConfiguration
   * @returns
   */
  setTableConfiguration(tableConfiguration: TableConfiguration) {
    this.tableConfiguration = tableConfiguration;
    return this;
  }

  /**
   *
   * @param tableLegendSets
   * @returns
   */
  setTableLegendSet(tableLegendSets: LegendSet[]) {
    this.tableLegendSets = tableLegendSets;
    return this;
  }

  /**
   *
   * @returns
   */
  getTableLegendSet(): LegendSet[] {
    return this.tableLegendSets;
  }

  /**
   * @description Set id to be used in rendering intended visualization
   * @param id String
   * @returns {D2Visualizer}
   */
  setId(id: string) {
    this.id = id;
    return this;
  }

  /**
   *
   * @param chartType
   * @returns
   */
  setChartType(chartType: string) {
    this.chartType = chartType;
    return this;
  }

  /**
   * @description Set data selection criterias
   * @param dataSelections {any[]}
   * @returns {D2Visualizer}
   */
  setSelections(dataSelections: any[]) {
    this.dataSelections = dataSelections;
    return this;
  }

  /**
   * @description Set visualization type
   * @param type {VisualizationType}
   * @returns {D2Visualizer}
   */
  setType(type: VisualizationType) {
    this.visualizationType = type;

    return this;
  }

  /**
   * @description Set visualization configurations
   * @param config {any}
   * @returns {D2Visualizer}
   */
  setConfig(config: Record<string, unknown>) {
    this.config = new VisualizationConfiguration(config);
    return this;
  }

  /**
   *
   * @param analytics
   * @returns
   */
  setData(analytics: any) {
    this.dataAnalytics = analytics;
    return this;
  }

  /**
   *
   * @param tracked entity instances
   * @returns
   */
  setTrackedEntityInstances(trackedEntityInstances: any[]) {
    this.trackedEntityInstances = trackedEntityInstances;
    return this;
  }

  /**
   *
   * @param program
   * @returns
   */
  setProgram(program: any) {
    this.program = program;
    return this;
  }

  /**
   *
   * @param geoFeatures
   * @returns
   */
  setGeoFeatures(geoFeatures: any) {
    this.geoFeatures = geoFeatures;
    return this;
  }

  /**
   *
   * @param legendSets
   * @returns
   */
  setLegendSet(legendSets: LegendSet[]) {
    this.legendSets = legendSets;
    return this;
  }

  /**
   *
   * @param d2VisualizerMapControl
   * @returns
   */
  setD2VisualizerMapControl(d2VisualizerMapControl: D2VisualizerMapControl) {
    this.d2VisualizerMapControl = d2VisualizerMapControl;
    return this;
  }

  /**
   *
   * @returns
   */
  getD2VisualizerMapControl(): D2VisualizerMapControl {
    return this.d2VisualizerMapControl;
  }

  /**
   *
   * @param layerStyle
   * @returns
   */
  setLayerStyle(layerStyle: string) {
    this.layerStyle = layerStyle;
    return this;
  }

  /**
   *
   * @returns
   */
  getLayerStyle() {
    return this.layerStyle;
  }

  /**
   *
   */
  setDashboardItem(dashboardItem: MapDashboardItem) {
    this.mapDashboardItem = dashboardItem;
    return this;
  }

  /**
   *
   * @returns
   */
  getDashboardItem(): MapDashboardItem {
    return this.mapDashboardItem;
  }

  /**
   *
   * @param dashboardExtensionItem
   * @returns
   */
  setDashboardExtensionItem(dashboardExtensionItem: MapDashboardExtensionItem) {
    this.mapDashboardExtensionItem = dashboardExtensionItem;
    return this;
  }

  setPlotOptions(plotOptions: VisualizerPlotOptions) {
    this.plotOptions = plotOptions;
    return this;
  }

  /**
   *
   * @returns
   */
  getDashboardExtensionItem(): MapDashboardExtensionItem {
    return this.mapDashboardExtensionItem;
  }

  /**
   *
   * @returns
   */
  private _getData(): Promise<any> {
    const analyticPromise = new Fn.Analytics();

    this.config.mergeDataSelections(this.dataSelections);
    const dataSelections: any[] = this.config.dataSelections.filter(
      (dataSelection) => dataSelection.dimension !== 'tea'
    );

    (dataSelections || []).forEach((dataSelection) => {
      switch (dataSelection.dimension) {
        case 'dx':
          analyticPromise.setData(
            dataSelection.items
              .map(
                (item: { dimensionItem: any; id: any }) =>
                  item.dimensionItem || item.id
              )
              .join(';')
          );
          break;

        case 'pe':
          analyticPromise.setPeriod(
            dataSelection.items
              .map(
                (item: { dimensionItem: any; id: any }) =>
                  item.dimensionItem || item.id
              )
              .join(';')
          );
          break;

        case 'ou':
          analyticPromise.setOrgUnit(
            dataSelection.items
              .map(
                (item: { dimensionItem: any; id: any }) =>
                  item.dimensionItem || item.id
              )
              .join(';')
          );
          break;

        default:
          analyticPromise.setDimension(
            dataSelection?.dimension,
            dataSelection.items.map((item: { id: any }) => item.id).join(';')
          );

          break;
      }
    });

    return analyticPromise.get();
  }

  /**
   *
   * @returns
   */
  async draw(): Promise<any> {
    const data = !this.trackedEntityInstances
      ? this.dataAnalytics || (await this._getData())?._data
      : undefined;

    switch (this.visualizationType) {
      case 'CHART':
      case 'LINE':
      case 'COLUMN':
      case 'BAR':
      case 'DOTTED':
      case 'PIE':
      case 'STACKED_BAR':
      case 'STACKED_COLUMN':
      case 'AREA':
      case 'RADAR':
      case 'SOLIDGAUGE':
        this.visualizer = new ChartVisualizer()
          .setId(this.id)
          .setConfig(this.config)
          .setData(data)
          .setType(this.visualizationType as ChartType)
          .setChartType(this.chartType);

        this.visualizer.draw();
        return this;
      case 'MAP': {
        // return new MapUtil()
        //   .setMapAnalytics(data as MapAnalytics)
        //   .setGeofeature(this.geoFeatures as any)
        //   .setLegendSet(this.legendSets)
        //   .setMapDashboardItem(this.config.config)
        //   .setMapDashboardExtensionItem(this.mapDashboardExtensionItem)
        //   .setContainer(this.id)
        //   .setStyle(this.layerStyle)
        //   .setShowLegend(this.d2VisualizerMapControl?.showMapLegend)
        //   .setShowLabel(this.d2VisualizerMapControl?.showMapLabel)
        //   .setShowValue(this.d2VisualizerMapControl?.showMapValue)
        //   .setShowMapTitle(this.d2VisualizerMapControl?.showMapTitle)
        //   .setShowBoundary(this.d2VisualizerMapControl?.showMapBoundary)
        //   .setShowMapSummary(this.d2VisualizerMapControl?.showMapSummary)
        //   .draw();
        const mapVisualizer = new MapVisualizer()
          .setId(this.id)
          .setBaseMap(this.config?.config?.basemap);

        (this.config?.config?.mapViews || []).forEach((mapView: any) => {
          const dataSelections = _.unionBy(
            this.dataSelections,
            getSelectionDimensionsFromFavorite(mapView),
            'dimension'
          );

          mapVisualizer.addLayer(
            new MapLayer()
              .setId(mapView.id)
              .setType(mapView.layer)
              .setDataSelections(dataSelections)
          );
        });

        mapVisualizer.draw();
        return this;
      }
      case 'REPORT_TABLE':
      case 'PIVOT_TABLE':
        this.visualizer = new TableUtil()
          .setId(this.id)
          .setTableDashboardItem(this.tableDashboardItem)
          .setTableConfiguration(this.config.toTableConfig())
          .setTableAnalytics(data)
          .setLegendSet(this.legendSets)
          .setPlotOptions(this.plotOptions);

        this.visualizer.draw();
        return this;
      case 'SINGLE_VALUE':
        new SingleValueVisualizer().setId(this.id).setData(data).draw();
        return this;
      case 'CUSTOM': {
        this.config.mergeDataSelections(this.dataSelections);
        const dataSelections: any[] = this.config.dataSelections.filter(
          (dataSelection) => dataSelection.domain === 'TRACKER'
        );
        new CustomVisualizer()
          .setId(this.id)
          .setConfig(this.config)
          .setData(data)
          .setSelections(dataSelections)
          .setTrackedEntityInstances(this.trackedEntityInstances)
          .draw();

        return this;
      }
      case 'TRACKED_ENTITY_LAYER': {
        this.config.mergeDataSelections(this.dataSelections);
        const dataSelections: any[] = this.config.dataSelections.filter(
          (dataSelection) => dataSelection.dimension === 'tea'
        );

        // const mapVisualizer = new MapVisualizer()
        //   .setId(this.id)
        //   .setBaseMap(this.config?.config?.basemap);

        // mapVisualizer.addLayer(
        //   new MapLayer()
        //     .setId(this.id)
        //     .setType(this.config as any)
        //     .setDataSelections(this.config.dataSelections)
        // );

        // console.log(this.config.dataSelections);

        // mapVisualizer.draw();

        new TrackedEntityLayer()
          .setId(this.id)
          .setConfig(this.config)
          .setSelections(dataSelections)
          .setTrackedEntityInstances(this.trackedEntityInstances)
          .setProgram(this.program)
          .draw();
        return this;
      }
      default:
        return this;
    }
  }

  /**
   *
   * @param downloadFormat
   * @returns
   */
  download(downloadFormat: any) {
    if (this.visualizer) {
      this.visualizer.download(downloadFormat);
    } else {
      console.warn('Visualizer is not set yet');
    }
  }
}
