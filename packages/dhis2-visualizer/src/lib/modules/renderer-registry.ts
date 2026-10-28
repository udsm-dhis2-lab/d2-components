/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from 'lodash';
import { D2Charts } from '@iapps/d2-charts';
import { SingleValueVisualizer } from '@iapps/d2-kpi-cards';
import {
  FetchMapDataSource,
  MapDataSource,
  MapLayer,
  MapProviderConfig,
  MapVisualizer,
} from '@iapps/d2-maps';
import { D2Pivots } from '@iapps/d2-pivots';
import { getSelectionDimensionsFromFavorite } from '../shared/helpers';
import {
  ChartType,
  VisualizationType,
} from '../shared/models/visualization-type.model';
import { CustomVisualizer } from '@iapps/d2-custom-visualizations';
import {
  SelectionFilterUtil,
  TrackedEntityInstanceData,
  TrackedEntityLayer,
} from '@iapps/d2-maps';
import { VisualizationData } from '../shared/models/visualization-data.model';

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
  mapProviderConfig?: MapProviderConfig;
  mapDataSource?: MapDataSource;
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
  new D2Charts()
    .setId(context.id)
    .setConfig(context.config)
    .setData(data)
    .setType(context.configuredType as ChartType) as FacadeRenderer;

export function createDefaultRendererRegistry(): RendererRegistry {
  const tableFactory: RendererFactory = (context, data) =>
    new D2Pivots()
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
    STACKED_AREA: chartFactory,
    RADAR: chartFactory,
    SOLIDGAUGE: chartFactory,
    MAP: (context) => {
      const dataSource =
        context.mapDataSource ||
        new FetchMapDataSource(async (selections) =>
          new VisualizationData().setSelections(selections).getAnalytics()
        );
      const renderer = new MapVisualizer()
        .setId(context.id)
        .setBaseUrl(context.baseUrl)
        .setBaseMap(context.config?.config?.basemap)
        .setLayerConfig(context.mapLayerConfig);
      if (context.mapProviderConfig) {
        renderer.setProviderConfig(context.mapProviderConfig);
      }

      (context.config?.config?.mapViews || []).forEach((mapView: any) => {
        const dataSelections = _.unionBy(
          context.dataSelections,
          getSelectionDimensionsFromFavorite(mapView),
          'dimension'
        );
        renderer.addLayer(
          new MapLayer(mapView, dataSource).setDataSelections(dataSelections)
        );
      });
      return renderer;
    },
    REPORT_TABLE: tableFactory,
    PIVOT_TABLE: tableFactory,
    SINGLE_VALUE: (context, data) =>
      new SingleValueVisualizer().setId(context.id).setData(data),
    YEAR_OVER_YEAR_LINE: chartFactory,
    YEAR_OVER_YEAR_COLUMN: chartFactory,
    CUSTOM: (context, data) => {
      context.config.mergeDataSelections(context.dataSelections);
      const selections = context.config.dataSelections.filter(
        (selection: any) => selection.domain === 'TRACKER'
      );
      const renderer = new CustomVisualizer()
        .setId(context.id)
        .setConfig(context.config)
        .setData(data)
        .setSelections(selections)
        .setTrackedEntityInstances(context.trackedEntityInstances);
      if (context.trackedEntityInstances) {
        const data = new TrackedEntityInstanceData(
          context.trackedEntityInstances
        );
        const filter = SelectionFilterUtil.getCustomFilter(selections);
        renderer.setTrackerEvaluator((expression) =>
          data.getExpressionData(expression, filter)
        );
      }
      return renderer;
    },
    TRACKED_ENTITY_LAYER: (context) => {
      context.config.mergeDataSelections(context.dataSelections);
      const selections = context.config.dataSelections.filter(
        (selection: any) => selection.dimension === 'tea'
      );
      const renderer = new TrackedEntityLayer()
        .setId(context.id)
        .setConfig(context.config)
        .setSelections(selections)
        .setTrackedEntityInstances(context.trackedEntityInstances)
        .setProgram(context.program) as TrackedEntityLayer;
      if (context.mapProviderConfig) {
        renderer.setProviderConfig({
          style: context.mapProviderConfig.style as string,
          accessToken: context.mapProviderConfig.accessToken,
        });
      }
      return renderer;
    },
    DICTIONARY: null,
    MAPBOX: null,
  };
  return new RendererRegistry(factories);
}
