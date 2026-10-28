/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnalyticsQuery,
  AnalyticsResponse,
  VisualizationDataSource,
  YearOverYearDataService,
} from '@iapps/d2-charts';
import { D2VisualizerMapControl } from './modules/map/models/map-control.model';
import { MapDashboardExtensionItem } from './modules/map/models/map-dashboard-extension.model';
import { MapDashboardItem } from './modules/map/models/map-dashboard-item.model';
import { TableAnalytics } from './modules/table/models/table-analytics.model';
import { TableConfiguration } from './modules/table/models/table-config.model';
import { TableDashboardItem } from './modules/table/models/table-dashboard-item.model';
import { LegendSet, Visualizer, VisualizerPlotOptions } from './shared/models';
import { VisualizationConfiguration } from './shared/models/visualization-configuration.model';
import { VisualizationType } from './shared/models/visualization-type.model';
import { MapLayerConfiguration } from './modules/map/models';
import {
  createDefaultRendererRegistry,
  FacadeRenderer,
  RendererRegistry,
} from './modules/renderer-registry';
import { D2Window } from '@iapps/d2-web-sdk';
import type { MapDataSource, MapProviderConfig } from '@iapps/d2-maps';
import {
  validateVisualizationRequest,
  TrackedEntityInstance,
  TrackerProgram,
  VisualizationRequest,
} from './public';
import { DownloadFormat } from './shared/models/download-format.model';
import { VisualizationDataSelection } from './shared/models/visualization-data-selection.model';
import {
  D2AnalyticsFacade,
  normalizeAnalyticsResponse,
} from './shared/data/analytics.facade';

export interface D2VisualizerOptions {
  /** Preserve the historical no-op by default; opt in to strict rejection. */
  unsupportedTypeBehavior?: 'ignore' | 'throw';
}

export class D2Visualizer {
  private readonly rendererRegistry: RendererRegistry;
  private readonly unsupportedTypeBehavior: 'ignore' | 'throw';
  private drawGeneration = 0;
  private yearOverYearController?: AbortController;
  private analyticsDataSource?: VisualizationDataSource;
  private readonly analyticsFacade = new D2AnalyticsFacade();
  private mapDataSource?: MapDataSource;
  private mapProviderConfig?: MapProviderConfig;
  dataSelections: VisualizationDataSelection[] = [];
  type!: VisualizationType;
  visualizationType!: VisualizationType;
  config!: VisualizationConfiguration;
  chartType?: string;
  id!: string;
  d2VisualizerMapControl?: D2VisualizerMapControl;
  legendSets?: LegendSet[];
  mapDashboardItem?: MapDashboardItem;
  mapDashboardExtensionItem?: MapDashboardExtensionItem;
  geoFeatures: unknown[] = [];
  dataAnalytics: unknown = undefined;
  layerStyle = 'default';
  trackedEntityInstances?: TrackedEntityInstance[];
  program?: TrackerProgram;
  data?: unknown;
  visualizer!: Visualizer;
  plotOptions!: VisualizerPlotOptions;
  baseUrl = '../../..';

  // TODO we need to find better way to manage configuration for each visualization type
  mapLayerConfig!: MapLayerConfiguration;

  // Table Configuration
  tableDashboardItem?: TableDashboardItem;
  tableAnalytics?: TableAnalytics;
  tableConfiguration?: TableConfiguration;
  tableLegendSets?: LegendSet[];

  constructor(options: D2VisualizerOptions = {}) {
    this.rendererRegistry = createDefaultRendererRegistry();
    this.unsupportedTypeBehavior = options.unsupportedTypeBehavior ?? 'ignore';
  }

  /**
   * Validated request-based rendering boundary.
   * Invalid input is rejected before analytics, provider, or DOM work begins.
   */
  async render(request: VisualizationRequest): Promise<this> {
    const valid = validateVisualizationRequest(request);
    this.id = valid.target.id;
    this.visualizationType = valid.type;
    this.dataSelections = (valid.selections ?? []).map((selection) => ({
      ...selection,
      items: selection.items.map((item) => ({ ...item })),
    }));
    this.analyticsFacade.setSelections(this.dataSelections);
    this.config = new VisualizationConfiguration({
      ...valid.configuration,
      type: valid.type,
    });
    this.dataAnalytics = 'data' in valid ? valid.data : undefined;
    if ('trackedEntityInstances' in valid)
      this.trackedEntityInstances = [...(valid.trackedEntityInstances ?? [])];
    if ('program' in valid) this.program = valid.program;
    if ('provider' in valid && valid.provider)
      this.mapProviderConfig = valid.provider as MapProviderConfig;
    return this.draw();
  }

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
  getTableDashboardItem(): TableDashboardItem | undefined {
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
  getTableAnalytics(): TableAnalytics | undefined {
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
  getTableLegendSet(): LegendSet[] | undefined {
    return this.tableLegendSets;
  }

  /**
   * @description Set id to be used in rendering intended visualization
   * @param id String
   * @returns {D2Visualizer}
   * @deprecated Use `render(request)` instead. Planned removal in v2.0.
   */
  setId(id: string) {
    this.id = id;
    return this;
  }

  /**
   *
   * @param chartType
   * @returns
   * @deprecated Chart type is represented by `request.type`. Planned removal in v2.0.
   */
  setChartType(chartType: string) {
    this.chartType = chartType;
    return this;
  }

  /**
   * @description Set data selection criterias
   * @param dataSelections visualization dimension selections
   * @returns {D2Visualizer}
   * @deprecated Use `render(request).selections`. Planned removal in v2.0.
   */
  setSelections(dataSelections: VisualizationDataSelection[]) {
    this.dataSelections = dataSelections;
    this.analyticsFacade.setSelections(dataSelections);
    return this;
  }

  /**
   * @description Set visualization type
   * @param type {VisualizationType}
   * @returns {D2Visualizer}
   * @deprecated Use `render(request).type`. Planned removal in v2.0.
   */
  setType(type: VisualizationType) {
    this.visualizationType = type;

    return this;
  }

  /**
   * @description Set visualization configurations
   * @param config visualization configuration
   * @returns {D2Visualizer}
   * @deprecated Use `render(request).configuration`. Planned removal in v2.0.
   */
  setConfig(config: Record<string, unknown>) {
    this.config = new VisualizationConfiguration(config);
    return this;
  }

  /**
   *
   * @param analytics
   * @returns
   * @deprecated Use `render(request).data`. Planned removal in v2.0.
   */
  setData(analytics: unknown) {
    this.dataAnalytics = analytics;
    return this;
  }

  /**
   *
   * @param tracked entity instances
   * @returns
   * @deprecated Use a tracker/custom request. Planned removal in v2.0.
   */
  setTrackedEntityInstances(trackedEntityInstances: TrackedEntityInstance[]) {
    this.trackedEntityInstances = trackedEntityInstances;
    return this;
  }

  /**
   *
   * @param program
   * @returns
   */
  setProgram(program: TrackerProgram) {
    this.program = program;
    return this;
  }

  /**
   *
   * @param geoFeatures
   * @returns
   */
  setGeoFeatures(geoFeatures: unknown[]) {
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
  getD2VisualizerMapControl(): D2VisualizerMapControl | undefined {
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
  getDashboardItem(): MapDashboardItem | undefined {
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

  setMapLayerConfig(mapLayerConfig: MapLayerConfiguration): D2Visualizer {
    if (this.visualizationType === 'MAP') {
      this.mapLayerConfig = mapLayerConfig;
    }

    return this;
  }

  setMapProviderConfig(config: MapProviderConfig): D2Visualizer {
    this.mapProviderConfig = config;
    return this;
  }

  setMapDataSource(dataSource: MapDataSource): D2Visualizer {
    this.mapDataSource = dataSource;
    return this;
  }

  /**
   *
   * @returns
   */
  getDashboardExtensionItem(): MapDashboardExtensionItem | undefined {
    return this.mapDashboardExtensionItem;
  }

  setBaseUrl(baseUrl: string): D2Visualizer {
    this.baseUrl = baseUrl;
    return this;
  }

  setDataSource(dataSource: VisualizationDataSource): D2Visualizer {
    this.analyticsDataSource = dataSource;
    this.analyticsFacade.setDataSource(dataSource);
    return this;
  }

  private _resolveVisType(): string {
    const t =
      this.visualizationType ??
      this.config?.type ??
      this.config?.config?.type ??
      this.config?.config?.config?.type;

    return String(t ?? '')
      .trim()
      .toUpperCase();
  }

  private async _getData(): Promise<any> {
    const visType = this._resolveVisType();

    if (visType !== 'YEAR_OVER_YEAR_LINE' && visType !== 'YEAR_OVER_YEAR_COLUMN') return this._getDataDefault();
    return this._getDataYearOverYearLine();
  }

  /**
   * Original behavior preserved as-is (moved here).
   */
  private _getDataDefault(): Promise<any> {
    this.config.mergeDataSelections(this.dataSelections);
    const dataSelections: any[] = this.config.dataSelections.filter(
      (dataSelection) => dataSelection.dimension !== 'tea'
    );
    return this.analyticsFacade.setSelections(dataSelections).getData();
  }

  /**
   * YEAR_OVER_YEAR_LINE (DHIS2 parity) — no Fn.Analytics
   *
   * DHIS2 behavior (as per your network capture):
   *  1) Fetch YEARS META once:
   *     /analytics?dimension=pe:LAST_5_YEARS;THIS_YEAR&skipData=true&skipMeta=false&includeMetadataDetails=true
   *     -> used to resolve actual years (e.g. 2021..2026)
   *
   *  2) For EACH YEAR (resolved above), fire two calls:
   *     a) weekly META (axis/order + metadata details)
   *        /analytics?dimension=pe:LAST_52_WEEKS&filter=ou:...&filter=dx:...&displayProperty=NAME
   *          &relativePeriodDate=YYYY-MM-DD&skipMeta=false&skipData=true&includeMetadataDetails=true
   *
   *     b) weekly VALUES (pe,value rows)
   *        /analytics?dimension=pe:LAST_52_WEEKS&filter=ou:...&filter=dx:...&displayProperty=NAME
   *          &relativePeriodDate=YYYY-MM-DD&skipMeta=true&skipData=false
   *
   * IMPORTANT:
   * Your d2.httpInstance.get() returns an object whose payload is under `.data`.
   * This implementation unwraps responses using (res?.data ?? res).
   */
  private async _getDataYearOverYearLine(signal?: AbortSignal): Promise<any> {
    const type = this._resolveVisType();
    this.config.mergeDataSelections(this.dataSelections);
    const favorite: any = this.config?.config ?? this.config;
    const dxId =
      this._pickFirstSelectionId('dx') ??
      this._pickFirstFavoriteId(favorite, 'filters', 'dx');
    const ouId =
      this._pickFirstSelectionId('ou') ??
      this._pickFirstFavoriteId(favorite, 'filters', 'ou') ??
      'USER_ORGUNIT';
    if (!dxId) {
      return {
        kind: type,
        error: true,
        message: `Missing dx selection for ${type}`,
      };
    }

    const dataSource =
      this.analyticsDataSource ?? new D2WebAnalyticsDataSource();
    try {
      const bundle = await new YearOverYearDataService(dataSource).load({
        dxId,
        ouId,
        relativePeriodDate: this._getRelativePeriodDate(favorite),
      }, signal);
      return { ...bundle, kind: type };
    } catch (error) {
      return {
        kind: type,
        error: true,
        message: String(error).includes('All year-over-year requests failed')
          ? `All per-year analytics calls failed for ${type}`
          : `Failed to load ${type} analytics`,
        details: { error: String(error) },
      };
    }
  }

  /**
   * Picks first selection id from merged config selections.
   */
  private _pickFirstSelectionId(dimension: string): string | null {
    const selections = this.config?.dataSelections ?? [];
    const sel = selections.find((s: any) => s?.dimension === dimension);
    const item = sel?.items?.[0];
    const id = item?.id;
    return id ? String(id) : null;
  }

  /**
   * Picks id from favorite config structure (filters or rows).
   * Example: filters[dimension=dx].items[0].id
   */
  private _pickFirstFavoriteId(
    fav: any,
    bucket: 'filters' | 'rows',
    dimension: string
  ): string | null {
    const group = (fav?.[bucket] ?? []).find(
      (x: any) => x?.dimension === dimension
    );
    const item = group?.items?.[0];
    const id = item?.dimensionItem || item?.id;
    return id ? String(id) : null;
  }

  /**
   * relativePeriodDate: must be YYYY-MM-DD
   * - Prefer configured date if available
   * - Else today's date (local)
   */
  private _getRelativePeriodDate(fav?: any): string {
    const configured =
      fav?.relativePeriodDate ||
      this.config?.relativePeriodDate ||
      (this as any).relativePeriodDate;

    if (configured && /^\d{4}-\d{2}-\d{2}$/.test(String(configured))) {
      return String(configured);
    }

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   *
   * @returns
   */
  async draw(): Promise<this> {
    const generation = ++this.drawGeneration;
    this.yearOverYearController?.abort();
    this.yearOverYearController = ['YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'].includes(this._resolveVisType())
      && this.dataAnalytics === undefined ? new AbortController() : undefined;
    let data: any;
    try {
      data =
        this.visualizationType !== 'MAP'
          ? !this.trackedEntityInstances
            ? this.dataAnalytics !== undefined
              ? this._resolveRendererData(this.dataAnalytics)
              : this.yearOverYearController
                ? await this._getDataYearOverYearLine(this.yearOverYearController.signal)
                : await this._getData()
            : undefined
          : undefined;
    } catch (error) {
      if (generation !== this.drawGeneration) return this;
      throw error;
    }

    if (generation !== this.drawGeneration) return this;

    const renderer = this.rendererRegistry.create(
      this.visualizationType,
      {
        id: this.id,
        configuredType: this.visualizationType,
        baseUrl: this.baseUrl,
        config: this.config,
        dataSelections: this.dataSelections,
        mapLayerConfig: this.mapLayerConfig,
        mapProviderConfig: this.mapProviderConfig,
        mapDataSource: this.mapDataSource,
        tableDashboardItem: this.tableDashboardItem,
        legendSets: this.legendSets,
        plotOptions: this.plotOptions,
        trackedEntityInstances: this.trackedEntityInstances,
        program: this.program,
      },
      data
    );

    if (!renderer) {
      if (this.unsupportedTypeBehavior === 'throw') {
        throw new Error(
          `Unsupported visualization type: ${this.visualizationType}`
        );
      }
      return this;
    }

    await this.activateRenderer(renderer, generation);
    return this;
  }

  private _resolveRendererData(data: unknown): unknown {
    return ['YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'].includes(this._resolveVisType())
      ? data
      : normalizeAnalyticsResponse(data);
  }

  private async activateRenderer(
    renderer: FacadeRenderer,
    generation: number
  ): Promise<void> {
    const previousRenderer = this.visualizer;
    if (previousRenderer) await previousRenderer.dispose();

    if (generation !== this.drawGeneration) {
      await renderer.dispose();
      return;
    }

    this.visualizer = renderer as Visualizer;
    await renderer.draw();

    if (generation !== this.drawGeneration && this.visualizer === renderer) {
      await renderer.dispose();
      delete (this as { visualizer?: Visualizer }).visualizer;
    }
  }

  /**
   *
   * @param downloadFormat
   * @returns
   */
  download(downloadFormat: DownloadFormat): void {
    if (this.visualizer) {
      this.visualizer.download(downloadFormat);
    } else {
      console.warn('Visualizer is not set yet');
    }
  }

  async dispose(): Promise<void> {
    this.drawGeneration += 1;
    this.yearOverYearController?.abort();
    if (this.visualizer) await this.visualizer.dispose();
    delete (this as { visualizer?: Visualizer }).visualizer;
  }
}

class D2WebAnalyticsDataSource implements VisualizationDataSource {
  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsResponse> {
    const parameters = new URLSearchParams();
    const [period, ...filters] = query.selections;
    if (period) {
      parameters.append(
        'dimension',
        `${period.dimension}:${period.items.join(';')}`
      );
    }
    filters.forEach((selection) =>
      parameters.append(
        'filter',
        `${selection.dimension}:${selection.items.join(';')}`
      )
    );
    if (query.relativePeriodDate) {
      parameters.set('relativePeriodDate', query.relativePeriodDate);
    }
    Object.entries(query.parameters ?? {}).forEach(([key, value]) =>
      parameters.set(key, String(value))
    );
    const response = await (
      window as unknown as D2Window
    ).d2Web.httpInstance.get(`analytics?${parameters.toString()}`);
    return (response?.data ?? response) as unknown as AnalyticsResponse;
  }
}
