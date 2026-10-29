/** Engine-neutral chart semantics. No Highcharts or browser types belong here. */
export type ChartSeriesKind =
  | 'line'
  | 'column'
  | 'bar'
  | 'area'
  | 'pie'
  | 'solidgauge'
  | 'gauge'
  | 'scatter';

export type ChartModuleRequirement =
  | 'exporting'
  | 'offline-exporting'
  | 'export-data'
  | 'highcharts-more'
  | 'solid-gauge'
  | 'drilldown';

export interface ChartPointModel {
  readonly id?: string;
  readonly name?: string;
  readonly value: number | string | null;
  readonly x?: number;
  readonly color?: string;
  readonly drilldown?: string;
  readonly label?: Readonly<Record<string, unknown>>;
}

export interface ChartSeriesBase {
  readonly id?: string;
  readonly name?: string;
  readonly index?: number;
  readonly turboThreshold?: number;
  readonly pointPlacement?: string;
  readonly axisIndex?: number;
  readonly lineWidth?: number;
  readonly states?: Readonly<Record<string, unknown>>;
  readonly colorByPoint?: boolean;
  readonly points: readonly ChartPointModel[];
}

export interface ScatterChartPointModel extends ChartPointModel {
  readonly x: number;
  readonly value: number;
  readonly id: string;
  readonly name: string;
}

/** One leaf category at one plot position; a parent is optional. */
export interface ChartCategoryTuple {
  readonly leaf: string;
  readonly parent?: string;
}

export type ChartSeriesModel = {
  [K in Exclude<ChartSeriesKind, 'scatter'>]: ChartSeriesBase & { readonly kind: K };
}[Exclude<ChartSeriesKind, 'scatter'>] | (Omit<ChartSeriesBase, 'points'> & {
  readonly kind: 'scatter';
  readonly points: readonly ScatterChartPointModel[];
});

export interface ChartAxisModel {
  readonly opposite?: boolean;
  readonly offset?: number;
  readonly categories?: readonly string[];
  readonly categoryTuples?: readonly ChartCategoryTuple[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly decimalsAllowed?: boolean;
  readonly labels?: Readonly<Record<string, unknown>>;
  readonly title?: Readonly<Record<string, unknown>>;
  readonly referenceLines?: readonly Readonly<Record<string, unknown>>[];
  readonly stackTotals?: Readonly<Record<string, unknown>>;
  readonly reversedStacks?: boolean;
  readonly tickPlacement?: string;
  readonly lineWidth?: number;
  readonly gridInterpolation?: string;
  readonly tickAmount?: number;
  readonly tickInterval?: number;
}

export interface ChartTextModel {
  readonly text?: string | null;
  readonly align?: string;
  readonly style?: Readonly<Record<string, unknown>>;
}

export interface ChartAnnotationModel {
  readonly kind: 'reference-line';
  readonly axisIndex: number;
  readonly value?: number;
  readonly label?: string;
}

export interface ChartAccessibilityModel {
  readonly description?: string;
  readonly enabled?: boolean;
}

/** Statistical overlays are not counted as source-data series. */
export type ChartOverlayModel =
  | { readonly kind: 'regression'; readonly name: string; readonly points: readonly { readonly x: number; readonly y: number }[] }
  | { readonly kind: 'outliers'; readonly name: string; readonly points: readonly { readonly id: string; readonly name: string; readonly x: number; readonly y: number }[] }
  | { readonly kind: 'extreme-line'; readonly axis: 'x' | 'y'; readonly value: number };

/** Presentation bags preserve current chart styling without importing an engine API. */
export interface ChartModel {
  readonly kind: 'CHART_MODEL';
  readonly visualType: string;
  readonly chartType: string;
  readonly seriesKind: ChartSeriesKind;
  readonly renderTarget?: string;
  readonly zoomMode?: string;
  readonly animation?: boolean;
  readonly polar?: boolean;
  readonly backgroundColor?: string | null;
  readonly borderWidth?: number | null;
  readonly shadow?: boolean;
  readonly title: ChartTextModel;
  readonly subtitle: string | ChartTextModel;
  readonly palette: readonly string[];
  readonly categoryAxis?: ChartAxisModel;
  readonly valueAxes?: readonly ChartAxisModel[];
  readonly pane?: Readonly<Record<string, unknown>>;
  readonly series: readonly ChartSeriesModel[];
  readonly overlays?: readonly ChartOverlayModel[];
  readonly drilldownSeries?: readonly ChartSeriesModel[];
  readonly seriesPresentation: Readonly<
    Record<string, Readonly<Record<string, unknown>>>
  >;
  readonly tooltip: Readonly<Record<string, unknown>>;
  readonly legend?: Readonly<Record<string, unknown>>;
  readonly credits: Readonly<Record<string, unknown>>;
  readonly exporting: Readonly<Record<string, unknown>>;
  readonly annotations: readonly ChartAnnotationModel[];
  readonly accessibility?: ChartAccessibilityModel;
  readonly requiredModules: readonly ChartModuleRequirement[];
}

/** @deprecated Legacy YOY model retained only for declaration compatibility. */
export interface YearOverYearChartModel {
  readonly kind: 'YEAR_OVER_YEAR_CHART_MODEL';
  readonly categories: readonly string[];
  readonly series: readonly {
    readonly name: string;
    readonly data: readonly (number | null)[];
  }[];
  readonly palette: readonly string[];
  readonly title: string;
  readonly subtitle: string;
  readonly showLegend: boolean;
  readonly showData: boolean;
  readonly digitGroupSeparator: 'SPACE' | 'COMMA' | 'NONE';
  readonly skipRounding: boolean;
  readonly tickStep: number;
  readonly currentYear: number;
  readonly requiredModules: readonly ChartModuleRequirement[];
}

export function requiredChartModules(
  visualType: string,
  hasDrilldown: boolean
): ChartModuleRequirement[] {
  const modules: ChartModuleRequirement[] = [
    'exporting',
    'offline-exporting',
    'export-data',
  ];
  if (
    visualType === 'radar' ||
    visualType === 'gauge' ||
    visualType === 'solidgauge'
  ) {
    modules.push('highcharts-more');
  }
  if (visualType === 'gauge' || visualType === 'solidgauge') {
    modules.push('solid-gauge');
  }
  if (hasDrilldown) modules.push('drilldown');
  return modules;
}
