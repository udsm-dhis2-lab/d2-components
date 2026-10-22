/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fn } from '@iapps/function-analytics';
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

export interface D2VisualizerOptions {
  /** Preserve the historical no-op by default; opt in to strict rejection. */
  unsupportedTypeBehavior?: 'ignore' | 'throw';
}

export class D2Visualizer {
  private readonly rendererRegistry: RendererRegistry;
  private readonly unsupportedTypeBehavior: 'ignore' | 'throw';
  private drawGeneration = 0;
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
  baseUrl = '../../..';

  // TODO we need to find better way to manage configuration for each visualization type
  mapLayerConfig!: MapLayerConfiguration;

  // Table Configuration
  tableDashboardItem: TableDashboardItem | any;
  tableAnalytics: TableAnalytics | any;
  tableConfiguration: TableConfiguration | any;
  tableLegendSets: LegendSet[] | any;

  constructor(options: D2VisualizerOptions = {}) {
    this.rendererRegistry = createDefaultRendererRegistry();
    this.unsupportedTypeBehavior = options.unsupportedTypeBehavior ?? 'ignore';
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
   * @deprecated
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

  setMapLayerConfig(mapLayerConfig: MapLayerConfiguration): D2Visualizer {
    if (this.visualizationType === 'MAP') {
      this.mapLayerConfig = mapLayerConfig;
    }

    return this;
  }

  /**
   *
   * @returns
   */
  getDashboardExtensionItem(): MapDashboardExtensionItem {
    return this.mapDashboardExtensionItem;
  }

  setBaseUrl(baseUrl: string): D2Visualizer {
    this.baseUrl = baseUrl;
    return this;
  }

  // /**
  //  *
  //  * @returns
  //  */
  // private _getData(): Promise<any> {
  //   const analyticPromise = new Fn.Analytics();

  //   this.config.mergeDataSelections(this.dataSelections);
  //   const dataSelections: any[] = this.config.dataSelections.filter(
  //     (dataSelection) => dataSelection.dimension !== 'tea'
  //   );

  //   (dataSelections || []).forEach((dataSelection) => {
  //     switch (dataSelection.dimension) {
  //       case 'dx':
  //         analyticPromise.setData(
  //           dataSelection.items
  //             .map(
  //               (item: { dimensionItem: any; id: any }) =>
  //                 item.dimensionItem || item.id
  //             )
  //             .join(';')
  //         );
  //         break;

  //       case 'pe':
  //         analyticPromise.setPeriod(
  //           dataSelection.items
  //             .map(
  //               (item: { dimensionItem: any; id: any }) =>
  //                 item.dimensionItem || item.id
  //             )
  //             .join(';')
  //         );
  //         break;

  //       case 'ou':
  //         analyticPromise.setOrgUnit(
  //           dataSelection.items
  //             .map(
  //               (item: { dimensionItem: any; id: any }) =>
  //                 item.dimensionItem || item.id
  //             )
  //             .join(';')
  //         );
  //         break;

  //       default:
  //         analyticPromise.setDimension(
  //           dataSelection?.dimension,
  //           dataSelection.items.map((item: { id: any }) => item.id).join(';')
  //         );

  //         break;
  //     }
  //   });

  //   return analyticPromise.get();
  // }

  // /**
  //  *
  //  * @returns
  //  */
  // private async _getData(): Promise<any> {
  //   // ✅ Keep default behavior for everything except YEAR_OVER_YEAR_LINE
  //   const visType = (
  //     this.visualizationType ||
  //     this.config?.type ||
  //     ''
  //   ).toString();

  //   if (visType !== 'YEAR_OVER_YEAR_LINE') {
  //     return this._getDataDefault();
  //   }

  //   // ✅ Special handling for YEAR_OVER_YEAR_LINE (DHIS2 = 2 analytics calls)
  //   return this._getDataYearOverYearLine();
  // }

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

    if (visType !== 'YEAR_OVER_YEAR_LINE') return this._getDataDefault();
    return this._getDataYearOverYearLine();
  }

  /**
   * Original behavior preserved as-is (moved here).
   */
  private _getDataDefault(): Promise<any> {
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
  // private async _getDataYearOverYearLine(): Promise<any> {
  //   const d2 = (window as unknown as D2Window).d2Web;

  //   // Always merge selections first (your current behavior)
  //   this.config.mergeDataSelections(this.dataSelections);

  //   // Normalize favorite/config holder (works with this.config or this.config.config)
  //   const fav: any = this.config?.config ?? this.config;

  //   // Helper: unwrap d2.httpInstance response
  //   const unwrap = (res: any) => res?.data ?? res;

  //   // Resolve dx/ou
  //   const dxId =
  //     this._pickFirstSelectionId('dx') ??
  //     this._pickFirstFavoriteId(fav, 'filters', 'dx');

  //   const ouId =
  //     this._pickFirstSelectionId('ou') ??
  //     this._pickFirstFavoriteId(fav, 'filters', 'ou') ??
  //     'USER_ORGUNIT';

  //   // Base relative date (e.g. 2026-02-17)
  //   const baseRelativeDate = this._getRelativePeriodDate(fav);

  //   if (!dxId) {
  //     return {
  //       kind: 'YEAR_OVER_YEAR_LINE',
  //       error: true,
  //       message: 'Missing dx selection for YEAR_OVER_YEAR_LINE',
  //       details: 'No dx found in selections or favorite filters.',
  //     };
  //   }

  //   // ---------------------------------------------------------------------------
  //   // 1) YEARS META (exact DHIS2 first call)
  //   // ---------------------------------------------------------------------------
  //   const yearsMetaUrl = this._buildAnalyticsUrl({
  //     dimension: ['pe:LAST_5_YEARS;THIS_YEAR'],
  //     params: {
  //       skipData: 'true',
  //       skipMeta: 'false',
  //       includeMetadataDetails: 'true',
  //     },
  //   });

  //   let yearsMeta: any;
  //   try {
  //     yearsMeta = unwrap(await d2.httpInstance.get(yearsMetaUrl));
  //   } catch (e) {
  //     return {
  //       kind: 'YEAR_OVER_YEAR_LINE',
  //       error: true,
  //       message: 'Failed to load years metadata for YEAR_OVER_YEAR_LINE',
  //       details: { yearsMetaUrl, error: String(e) },
  //     };
  //   }

  //   const years: number[] = (yearsMeta?.metaData?.dimensions?.pe ?? [])
  //     .map((y: any) => Number(y))
  //     .filter((y: number) => Number.isFinite(y))
  //     .sort((a: number, b: number) => a - b);

  //   if (!years.length) {
  //     return {
  //       kind: 'YEAR_OVER_YEAR_LINE',
  //       error: true,
  //       message: 'Could not resolve years from years meta response',
  //       details: { yearsMetaUrl, yearsMeta },
  //     };
  //   }

  //   // ---------------------------------------------------------------------------
  //   // 2) FOR EACH YEAR: weekly META + weekly VALUES (exact DHIS2 calls)
  //   // ---------------------------------------------------------------------------
  //   const perYearSettled = await Promise.allSettled(
  //     years.map(async (year) => {
  //       const relDate = this._shiftDateYear(baseRelativeDate, year);

  //       const weeklyMetaUrl = this._buildAnalyticsUrl({
  //         dimension: ['pe:LAST_52_WEEKS'],
  //         filter: [`ou:${ouId}`, `dx:${dxId}`],
  //         params: {
  //           displayProperty: 'NAME',
  //           relativePeriodDate: relDate,
  //           skipMeta: 'false',
  //           skipData: 'true',
  //           includeMetadataDetails: 'true',
  //         },
  //       });

  //       const weeklyDataUrl = this._buildAnalyticsUrl({
  //         dimension: ['pe:LAST_52_WEEKS'],
  //         filter: [`ou:${ouId}`, `dx:${dxId}`],
  //         params: {
  //           displayProperty: 'NAME',
  //           relativePeriodDate: relDate,
  //           skipMeta: 'true',
  //           skipData: 'false',
  //         },
  //       });

  //       // Fetch meta + data in parallel per year
  //       const [metaRes, dataRes] = await Promise.all([
  //         d2.httpInstance.get(weeklyMetaUrl),
  //         d2.httpInstance.get(weeklyDataUrl),
  //       ]);

  //       const weeklyMeta = unwrap(metaRes);
  //       const weeklyData = unwrap(dataRes);

  //       return {
  //         year,
  //         relDate,
  //         weeklyMetaUrl,
  //         weeklyDataUrl,
  //         weeklyMeta,
  //         weeklyData,
  //       };
  //     })
  //   );

  //   const perYearOk = perYearSettled
  //     .filter((r) => r.status === 'fulfilled')
  //     .map((r: any) => r.value as any);

  //   const perYearFailed = perYearSettled
  //     .filter((r) => r.status === 'rejected')
  //     .map((r: any) => String(r.reason));

  //   if (!perYearOk.length) {
  //     return {
  //       kind: 'YEAR_OVER_YEAR_LINE',
  //       error: true,
  //       message: 'All per-year analytics calls failed for YEAR_OVER_YEAR_LINE',
  //       details: { years, perYearFailed },
  //     };
  //   }

  //   // ---------------------------------------------------------------------------
  //   // 3) Canonical axis (DHIS2 effectively uses latest year’s weeklyMeta ordering)
  //   // ---------------------------------------------------------------------------
  //   const latestYear = Math.max(...perYearOk.map((x: any) => x.year));
  //   const axisSource =
  //     perYearOk.find((x: any) => x.year === latestYear) ?? perYearOk[0];

  //   const axisPeriodIds: string[] =
  //     axisSource?.weeklyMeta?.metaData?.dimensions?.pe ?? [];
  //   const axisItems: any = axisSource?.weeklyMeta?.metaData?.items ?? {};

  //   const categories: string[] = axisPeriodIds.map((pid) =>
  //     this._toWeekLabel(axisItems?.[pid]?.name ?? pid)
  //   );

  //   // ---------------------------------------------------------------------------
  //   // 4) Build aligned series (align by week number W1..W53)
  //   //     - Missing weeks are set to 0 (matches your screenshot baseline behavior)
  //   // ---------------------------------------------------------------------------
  //   const series = perYearOk
  //     .map((item: any) => {
  //       const headers = item.weeklyData?.headers ?? [];
  //       const rows = item.weeklyData?.rows ?? [];

  //       const peIdx = this._headerIndex(headers, 'pe');
  //       const vIdx = this._headerIndex(headers, 'value');

  //       const weekValue = new Map<number, number>();
  //       for (const row of rows) {
  //         const pe = row?.[peIdx];
  //         const v = Number(row?.[vIdx]);
  //         const wk = this._parseWeekOfYear(pe);
  //         if (wk && Number.isFinite(v)) weekValue.set(wk, v);
  //       }

  //       const aligned = axisPeriodIds.map((pid) => {
  //         const wk = this._parseWeekOfYear(pid);
  //         return wk ? (weekValue.has(wk) ? weekValue.get(wk)! : 0) : 0;
  //       });

  //       return {
  //         name: String(item.year),
  //         year: item.year,
  //         data: aligned, // 52 points
  //       };
  //     })
  //     .sort((a: any, b: any) => a.year - b.year);

  //   // ---------------------------------------------------------------------------
  //   // 5) Return bundle for drawing
  //   // ---------------------------------------------------------------------------
  //   return {
  //     kind: 'YEAR_OVER_YEAR_LINE',
  //     yearsMeta: {
  //       url: yearsMetaUrl,
  //       data: yearsMeta,
  //     },
  //     axis: {
  //       year: axisSource.year,
  //       relativePeriodDate: axisSource.relDate,
  //       periodIds: axisPeriodIds,
  //       categories,
  //       meta: axisSource.weeklyMeta,
  //       url: axisSource.weeklyMetaUrl,
  //     },
  //     series,
  //     rawPerYear: perYearOk.map((x: any) => ({
  //       year: x.year,
  //       relDate: x.relDate,
  //       weeklyMetaUrl: x.weeklyMetaUrl,
  //       weeklyDataUrl: x.weeklyDataUrl,
  //       weeklyMeta: x.weeklyMeta,
  //       weeklyData: x.weeklyData,
  //     })),
  //     warnings: perYearFailed.length ? { perYearFailed } : undefined,
  //     context: {
  //       dxId,
  //       ouId,
  //       baseRelativeDate,
  //       years,
  //     },
  //   };
  // }
  private async _getDataYearOverYearLine(): Promise<any> {
    const d2 = (window as unknown as D2Window).d2Web;

    // Always merge selections first (your current behavior)
    this.config.mergeDataSelections(this.dataSelections);

    // Normalize favorite/config holder
    const fav: any = this.config?.config ?? this.config;

    // Unwrap axios-like response
    const unwrap = (res: any) => res?.data ?? res;

    const dxId =
      this._pickFirstSelectionId('dx') ??
      this._pickFirstFavoriteId(fav, 'filters', 'dx');

    const ouId =
      this._pickFirstSelectionId('ou') ??
      this._pickFirstFavoriteId(fav, 'filters', 'ou') ??
      'USER_ORGUNIT';

    const baseRelativeDate =
      this._getRelativePeriodDate(fav) ?? new Date().toISOString().slice(0, 10);

    if (!dxId) {
      return {
        _data: {
          kind: 'YEAR_OVER_YEAR_LINE',
          error: true,
          message: 'Missing dx selection for YEAR_OVER_YEAR_LINE',
        },
      };
    }

    // 1) YEARS META (exact DHIS2 first call)
    const yearsMetaUrl = this._buildAnalyticsUrl({
      dimension: ['pe:LAST_5_YEARS;THIS_YEAR'],
      params: {
        skipData: 'true',
        skipMeta: 'false',
        includeMetadataDetails: 'true',
      },
    });

    let yearsMeta: any;
    try {
      yearsMeta = unwrap(await d2.httpInstance.get(yearsMetaUrl));
    } catch (e) {
      return {
        _data: {
          kind: 'YEAR_OVER_YEAR_LINE',
          error: true,
          message: 'Failed to load years metadata for YEAR_OVER_YEAR_LINE',
          details: { yearsMetaUrl, error: String(e) },
        },
      };
    }

    const years: number[] = (yearsMeta?.metaData?.dimensions?.pe ?? [])
      .map((y: any) => Number(y))
      .filter((y: number) => Number.isFinite(y))
      .sort((a: number, b: number) => a - b);

    if (!years.length) {
      return {
        _data: {
          kind: 'YEAR_OVER_YEAR_LINE',
          error: true,
          message: 'Could not resolve years from years meta response',
          details: { yearsMetaUrl, yearsMeta },
        },
      };
    }

    // 2) For each year: weekly META + weekly DATA (exact DHIS2 calls)
    const perYearSettled = await Promise.allSettled(
      years.map(async (year) => {
        const relDate = this._shiftDateYear(baseRelativeDate, year);

        const weeklyMetaUrl = this._buildAnalyticsUrl({
          dimension: ['pe:LAST_52_WEEKS'],
          filter: [`ou:${ouId}`, `dx:${dxId}`],
          params: {
            displayProperty: 'NAME',
            relativePeriodDate: relDate,
            skipMeta: 'false',
            skipData: 'true',
            includeMetadataDetails: 'true',
          },
        });

        const weeklyDataUrl = this._buildAnalyticsUrl({
          dimension: ['pe:LAST_52_WEEKS'],
          filter: [`ou:${ouId}`, `dx:${dxId}`],
          params: {
            displayProperty: 'NAME',
            relativePeriodDate: relDate,
            skipMeta: 'true',
            skipData: 'false',
          },
        });

        const [metaRes, dataRes] = await Promise.all([
          d2.httpInstance.get(weeklyMetaUrl),
          d2.httpInstance.get(weeklyDataUrl),
        ]);

        return {
          year,
          relDate,
          weeklyMetaUrl,
          weeklyDataUrl,
          weeklyMeta: unwrap(metaRes),
          weeklyData: unwrap(dataRes),
        };
      })
    );

    const perYearOk = perYearSettled
      .filter((r) => r.status === 'fulfilled')
      .map((r: any) => r.value as any);

    const perYearFailed = perYearSettled
      .filter((r) => r.status === 'rejected')
      .map((r: any) => r.reason);

    if (!perYearOk.length) {
      return {
        _data: {
          kind: 'YEAR_OVER_YEAR_LINE',
          error: true,
          message:
            'All per-year analytics calls failed for YEAR_OVER_YEAR_LINE',
          details: { years, perYearFailed },
        },
      };
    }

    // 3) Canonical axis from latest year weeklyMeta
    const latestYear = Math.max(...perYearOk.map((x: any) => x.year));
    const axisSource =
      perYearOk.find((x: any) => x.year === latestYear) ?? perYearOk[0];

    const axisPeriodIds: string[] =
      axisSource?.weeklyMeta?.metaData?.dimensions?.pe ?? [];
    const axisItems: any = axisSource?.weeklyMeta?.metaData?.items ?? {};

    if (!axisPeriodIds.length) {
      return {
        _data: {
          kind: 'YEAR_OVER_YEAR_LINE',
          error: true,
          message: 'Weekly meta returned no axis periods',
          details: { axisSource },
        },
      };
    }

    const categories: string[] = axisPeriodIds.map((pid) =>
      this._toWeekLabel(axisItems?.[pid]?.name ?? pid)
    );

    // 4) Build aligned series (by week number)
    const series = perYearOk
      .map((item: any) => {
        const headers = item.weeklyData?.headers ?? [];
        const rows = item.weeklyData?.rows ?? [];

        const peIdx = this._headerIndex(headers, 'pe');
        const vIdx = this._headerIndex(headers, 'value');

        const weekValue = new Map<number, number>();
        for (const row of rows) {
          const pe = row?.[peIdx];
          const v = Number(row?.[vIdx]);
          const wk = this._parseWeekOfYear(pe);
          if (wk && Number.isFinite(v)) weekValue.set(wk, v);
        }

        const aligned = axisPeriodIds.map((pid) => {
          const wk = this._parseWeekOfYear(pid);
          return wk ? (weekValue.has(wk) ? weekValue.get(wk)! : 0) : 0;
        });

        return {
          name: String(item.year),
          year: item.year,
          data: aligned,
        };
      })
      .sort((a: any, b: any) => a.year - b.year);

    // ✅ IMPORTANT: return under _data to match draw() contract
    return {
      _data: {
        kind: 'YEAR_OVER_YEAR_LINE',
        yearsMeta: { url: yearsMetaUrl, data: yearsMeta },
        axis: {
          year: axisSource.year,
          relativePeriodDate: axisSource.relDate,
          periodIds: axisPeriodIds,
          categories,
          meta: axisSource.weeklyMeta,
          url: axisSource.weeklyMetaUrl,
        },
        series,
        rawPerYear: perYearOk,
        warnings: perYearFailed?.length ? { perYearFailed } : undefined,
        context: { dxId, ouId, baseRelativeDate, years },
      },
    };
  }

  /* -------------------------------------------------------------------------- */
  /* Helpers (drop these into the same class where you implement YoY)            */
  /* -------------------------------------------------------------------------- */

  private _buildAnalyticsUrl(args: {
    dimension?: string[];
    filter?: string[];
    params?: Record<string, string>;
  }): string {
    const sp = new URLSearchParams();
    (args.dimension ?? []).forEach((d) => sp.append('dimension', d));
    (args.filter ?? []).forEach((f) => sp.append('filter', f));
    Object.entries(args.params ?? {}).forEach(([k, v]) => sp.set(k, String(v)));
    return `analytics?${sp.toString()}`;
  }

  /**
   * Replace just the YEAR part, keep same MM-DD.
   * Example: ("2026-02-17", 2023) -> "2023-02-17"
   */
  private _shiftDateYear(dateYYYYMMDD: string, targetYear: number): string {
    const parts = String(dateYYYYMMDD).split('-');
    if (parts.length !== 3) return String(dateYYYYMMDD);
    const [, mm, dd] = parts;
    return `${targetYear}-${mm}-${dd}`;
  }

  private _headerIndex(headers: Array<{ name: string }>, name: string): number {
    return headers.findIndex((h) => h?.name === name);
  }

  /**
   * Extract week number from:
   *  - "2022W7"
   *  - "W45 2023"
   * Returns 1..53 or null
   */
  private _parseWeekOfYear(periodIdOrName: string): number | null {
    const s = String(periodIdOrName ?? '');

    // "2022W7"
    let m = /^\d{4}W(\d{1,2})$/.exec(s);
    if (m) return Number(m[1]);

    // "W45 2023"
    m = /^W(\d{1,2})\b/.exec(s);
    if (m) return Number(m[1]);

    return null;
  }

  /**
   * Convert "W45 2023" -> "W45" or "2023W45" -> "W45"
   */
  private _toWeekLabel(nameOrId: string): string {
    const s = String(nameOrId ?? '');

    let m = /^W(\d{1,2})\b/.exec(s);
    if (m) return `W${m[1]}`;

    m = /^\d{4}W(\d{1,2})$/.exec(s);
    if (m) return `W${m[1]}`;

    return s;
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
  async draw(): Promise<any> {
    const generation = ++this.drawGeneration;
    let data: any;
    try {
      data =
        this.visualizationType !== 'MAP'
          ? !this.trackedEntityInstances
            ? this.dataAnalytics || (await this._getData())
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
  download(downloadFormat: any) {
    if (this.visualizer) {
      this.visualizer.download(downloadFormat);
    } else {
      console.warn('Visualizer is not set yet');
    }
  }

  async dispose(): Promise<void> {
    this.drawGeneration += 1;
    if (this.visualizer) await this.visualizer.dispose();
    delete (this as { visualizer?: Visualizer }).visualizer;
  }
}
