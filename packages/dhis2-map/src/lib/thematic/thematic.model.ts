import type { FeatureCollection, Geometry } from 'geojson';
import type { LegendSet } from '../models/legend-set.model';

export type ThematicMode = 'CHOROPLETH' | 'BUBBLE';
export type ThematicValueState = 'value' | 'zero' | 'missing-value' | 'unclassified' | 'missing-geometry';
export interface ThematicDatum { id: string; name: string; geometry: Geometry | null; value: number | null }
export interface ThematicClass { min: number; max: number; color: string; label: string }
export interface ThematicOptions {
  mode: ThematicMode;
  method: 1 | 2 | 3 | 10;
  classes?: number;
  colorScale?: string;
  legendSet?: LegendSet;
  noDataColor?: string;
  unclassifiedColor?: string;
  radiusLow?: number;
  radiusHigh?: number;
  opacity?: number;
}
export interface ThematicResult {
  features: FeatureCollection;
  missingGeometry: readonly string[];
  counts: Readonly<Record<ThematicValueState, number>>;
  classes: readonly ThematicClass[];
  legendSet: LegendSet;
}
