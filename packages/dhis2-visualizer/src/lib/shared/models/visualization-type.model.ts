export type ChartType =
  | 'COLUMN'
  | 'LINE'
  | 'BAR'
  | 'DOTTED'
  | 'PIE'
  | 'SINGLE_VALUE'
  | 'STACKED_COLUMN'
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
  | 'TRACKED_ENTITY_LAYER';
