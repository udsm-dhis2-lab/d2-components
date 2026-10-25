import type { AnalyticsResponse } from '../shared/contracts/data-source.contracts';
import type { ChartType } from '../shared/models/visualization-type.model';

export type SupportedChartType = Exclude<
  ChartType,
  'SINGLE_VALUE' | 'YEAR_OVER_YEAR_LINE'
>;

export interface VisualizationTargetRequest {
  id: string;
}

export interface VisualizationSelectionItem {
  id: string;
  name?: string;
  dimensionItem?: string;
  code?: string;
}

export interface VisualizationSelection {
  dimension: string;
  domain?: 'TRACKER' | 'AGGREGATE';
  items: readonly VisualizationSelectionItem[];
}

export interface VisualizationRequestBase<TType extends string> {
  type: TType;
  target: VisualizationTargetRequest;
  configuration: Readonly<Record<string, unknown>>;
  selections?: readonly VisualizationSelection[];
}

export interface ChartVisualizationRequest
  extends VisualizationRequestBase<'CHART' | SupportedChartType> {
  data?: AnalyticsResponse;
}

export interface YearOverYearVisualizationRequest
  extends VisualizationRequestBase<'YEAR_OVER_YEAR_LINE'> {
  data?: AnalyticsResponse | Readonly<Record<string, unknown>>;
}

export interface TableVisualizationRequest
  extends VisualizationRequestBase<'REPORT_TABLE' | 'PIVOT_TABLE'> {
  data?: AnalyticsResponse;
}

export interface SingleValueVisualizationRequest
  extends VisualizationRequestBase<'SINGLE_VALUE'> {
  data?: AnalyticsResponse;
}

export interface MapProviderRequest {
  style: string | Readonly<Record<string, unknown>>;
  accessToken?: string;
}

export interface MapVisualizationRequest
  extends VisualizationRequestBase<'MAP'> {
  provider?: MapProviderRequest;
}

export interface TrackerAttribute {
  attribute: string;
  value: string;
}

export interface TrackerEnrollment {
  geometry?: Readonly<Record<string, unknown>>;
  events?: readonly Readonly<Record<string, unknown>>[];
  [property: string]: unknown;
}

export interface TrackedEntityInstance {
  attributes: readonly TrackerAttribute[];
  enrollments?: readonly TrackerEnrollment[];
  [property: string]: unknown;
}

export interface TrackerProgram {
  name?: string;
  programTrackedEntityAttributes?: readonly Readonly<Record<string, unknown>>[];
  [property: string]: unknown;
}

export interface TrackerMapVisualizationRequest
  extends VisualizationRequestBase<'TRACKED_ENTITY_LAYER'> {
  trackedEntityInstances: readonly TrackedEntityInstance[];
  program: TrackerProgram;
  provider: MapProviderRequest;
}

export interface CustomVisualizationRequest
  extends VisualizationRequestBase<'CUSTOM'> {
  data?: AnalyticsResponse;
  trackedEntityInstances?: readonly TrackedEntityInstance[];
}

export type VisualizationRequest =
  | ChartVisualizationRequest
  | YearOverYearVisualizationRequest
  | TableVisualizationRequest
  | SingleValueVisualizationRequest
  | MapVisualizationRequest
  | TrackerMapVisualizationRequest
  | CustomVisualizationRequest;

export type SupportedVisualizationType = VisualizationRequest['type'];
