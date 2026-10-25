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

/** Visualization identifiers implemented by the compatibility facade. */
export type ImplementedVisualizationType =
  | ChartType
  | 'CHART'
  | 'REPORT_TABLE'
  | 'PIVOT_TABLE'
  | 'MAP'
  | 'CUSTOM'
  | 'YEAR_OVER_YEAR_LINE'
  | 'TRACKED_ENTITY_LAYER';

/**
 * @deprecated These historical identifiers have no renderer. They remain only
 * for fluent-API source compatibility and are rejected by the request API.
 */
export type UnsupportedVisualizationType = 'DICTIONARY' | 'MAPBOX';

export type VisualizationType =
  | ImplementedVisualizationType
  | UnsupportedVisualizationType;
