export type ChartType =
  | 'COLUMN'
  | 'LINE'
  | 'BAR'
  | 'DOTTED'
  | 'PIE'
  | 'SINGLE_VALUE'
  | 'STACKED_COLUMN'
  | 'YEAR_OVER_YEAR_LINE'
  | 'STACKED_BAR'
  | 'AREA'
  | 'RADAR'
  | 'SOLIDGAUGE';

export type VisualizationType =
  | ChartType
  | 'CHART'
  | 'REPORT_TABLE'
  | 'PIVOT_TABLE'
  | 'MAP'
  | 'DICTIONARY'
  | 'CUSTOM'
  | 'MAPBOX'
  | 'YEAR_OVER_YEAR_LINE'
  | 'TRACKED_ENTITY_LAYER';
