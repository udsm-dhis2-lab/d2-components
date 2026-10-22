/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from 'lodash';
import { getSelectionDimensionsFromFavorite } from '../shared/helpers';
import {
  ChartType,
  VisualizationType,
} from '../shared/models/visualization-type.model';
import { ChartVisualizer } from './chart/chart-visualizer';
import { CustomVisualizer } from './custom/custom-visualizer';
import { MapLayer } from './map/layers/map-layer.model';
import { TrackedEntityLayer } from './map/layers/tracked-entity-layer.model';
import { MapVisualizer } from './map/map-visualizer';
import { SingleValueVisualizer } from './single-value/single-value-visualizer';
import { TableUtil } from './table/utils/table.util';
import { YearOverYearLineHighchartsVisualizer } from './year-over-year-line/year-over-year-line';

export interface FacadeRenderer {
  draw(): void | Promise<void>;
  download(downloadFormat: any): void;
  dispose(): void | Promise<void>;
}

export interface RendererContext {
  id: string;
  configuredType: VisualizationType;
  baseUrl: string;
  config: any;
  dataSelections: any[];
  mapLayerConfig: any;
  tableDashboardItem: any;
  legendSets: any;
  plotOptions: any;
  trackedEntityInstances?: any[];
  program: any;
}

export type RendererFactory = (
  context: RendererContext,
  data: any
) => FacadeRenderer;

export class RendererRegistry {
  constructor(
    private readonly factories: Readonly<
      Record<VisualizationType, RendererFactory | null>
    >
  ) {}

  create(
    type: VisualizationType,
    context: RendererContext,
    data: any
  ): FacadeRenderer | undefined {
    return this.factories[type]?.(context, data);
  }

  supports(type: VisualizationType): boolean {
    return Boolean(this.factories[type]);
  }
}

const chartFactory: RendererFactory = (context, data) =>
  new ChartVisualizer()
    .setId(context.id)
    .setConfig(context.config)
    .setData(data)
    .setType(context.configuredType as ChartType) as FacadeRenderer;

export function createDefaultRendererRegistry(): RendererRegistry {
  const tableFactory: RendererFactory = (context, data) =>
    new TableUtil()
      .setId(context.id)
      .setTableDashboardItem(context.tableDashboardItem)
      .setTableConfiguration(context.config.toTableConfig())
      .setTableAnalytics(data)
      .setLegendSet(context.legendSets)
      .setPlotOptions(context.plotOptions);
  const factories: Record<VisualizationType, RendererFactory | null> = {
    CHART: chartFactory,
    LINE: chartFactory,
    COLUMN: chartFactory,
    BAR: chartFactory,
    DOTTED: chartFactory,
    PIE: chartFactory,
    STACKED_BAR: chartFactory,
    STACKED_COLUMN: chartFactory,
    AREA: chartFactory,
    RADAR: chartFactory,
    SOLIDGAUGE: chartFactory,
    MAP: (context) => {
      const renderer = new MapVisualizer()
        .setId(context.id)
        .setBaseUrl(context.baseUrl)
        .setBaseMap(context.config?.config?.basemap)
        .setLayerConfig(context.mapLayerConfig);

      (context.config?.config?.mapViews || []).forEach((mapView: any) => {
        const dataSelections = _.unionBy(
          context.dataSelections,
          getSelectionDimensionsFromFavorite(mapView),
          'dimension'
        );
        renderer.addLayer(
          new MapLayer(mapView).setDataSelections(dataSelections)
        );
      });
      return renderer;
    },
    REPORT_TABLE: tableFactory,
    PIVOT_TABLE: tableFactory,
    SINGLE_VALUE: (context, data) =>
      new SingleValueVisualizer().setId(context.id).setData(data),
    YEAR_OVER_YEAR_LINE: (context, data) =>
      new YearOverYearLineHighchartsVisualizer()
        .setId(context.id)
        .setConfig(context.config?.config ?? context.config)
        .setSelections(context.dataSelections)
        .setData(data),
    CUSTOM: (context, data) => {
      context.config.mergeDataSelections(context.dataSelections);
      const selections = context.config.dataSelections.filter(
        (selection: any) => selection.domain === 'TRACKER'
      );
      return new CustomVisualizer()
        .setId(context.id)
        .setConfig(context.config)
        .setData(data)
        .setSelections(selections)
        .setTrackedEntityInstances(context.trackedEntityInstances);
    },
    TRACKED_ENTITY_LAYER: (context) => {
      context.config.mergeDataSelections(context.dataSelections);
      const selections = context.config.dataSelections.filter(
        (selection: any) => selection.dimension === 'tea'
      );
      return new TrackedEntityLayer()
        .setId(context.id)
        .setConfig(context.config)
        .setSelections(selections)
        .setTrackedEntityInstances(context.trackedEntityInstances)
        .setProgram(context.program);
    },
    DICTIONARY: null,
    MAPBOX: null,
  };
  return new RendererRegistry(factories);
}
