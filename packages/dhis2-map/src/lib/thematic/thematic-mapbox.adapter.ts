import type { ThematicMode } from './thematic.model';

/** The only thematic-to-Mapbox expression boundary. */
export function thematicMapboxStyle(mode: ThematicMode, opacity = 1) {
  return mode === 'BUBBLE'
    ? { type: 'circle' as const, paint: {
      'circle-color': ['get', 'color'], 'circle-radius': ['get', 'radius'], 'circle-opacity': opacity }, layout: {} }
    : { type: 'fill' as const, paint: {
      'fill-color': ['get', 'color'], 'fill-opacity': opacity }, layout: {} };
}
