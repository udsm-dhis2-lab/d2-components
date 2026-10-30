import { mapAnalyticsFixture, mapGeoFeaturesFixture } from '../../testing/fixtures/map-characterization.fixtures';
import { buildThematic, joinThematicData, thematicClasses } from './thematic.transform';
import { thematicMapboxStyle } from './thematic-mapbox.adapter';
import type { MapGeoFeature } from '../models/map-geo-feature.model';
import type { ThematicDatum } from './thematic.model';

const polygon = JSON.stringify([[[35,-6],[36,-6],[36,-7],[35,-7],[35,-6]]]);
const geo = (id: string, co: string): MapGeoFeature => ({ id, na: id, co, ty: 2 } as MapGeoFeature);
const data: ThematicDatum[] = [
  { id: 'zero', name: 'Same', value: 0, geometry: { type: 'Polygon', coordinates: [[[35,-6],[36,-6],[36,-7],[35,-7],[35,-6]]] } },
  { id: 'high', name: 'Same', value: 10, geometry: { type: 'Polygon', coordinates: [[[36,-6],[37,-6],[37,-7],[36,-7],[36,-6]]] } },
  { id: 'missing', name: 'Missing', value: null, geometry: { type: 'Polygon', coordinates: [[[37,-6],[38,-6],[38,-7],[37,-7],[37,-6]]] } },
  { id: 'no-geometry', name: 'No geometry', value: 5, geometry: null },
];

describe('pure thematic joins, classification and presentation', () => {
  it('joins by OU ID, not duplicate display labels, retaining zero and absent values', () => {
    const joined = joinThematicData([
      geo('ou-a', polygon), geo('ou-b', polygon), geo('ou-missing', '[]'),
    ], mapAnalyticsFixture());
    expect(joined.map(item => [item.id, item.value])).toEqual([
      ['ou-a', 12], ['ou-b', 0], ['ou-missing', null],
    ]);
    expect(joined[2].geometry).toBeNull();
    expect(joinThematicData(mapGeoFeaturesFixture() as MapGeoFeature[], mapAnalyticsFixture())[0].geometry)
      .toEqual({ type: 'Point', coordinates: [35, -6] });
  });
  it('keeps zero, missing value and missing geometry separate and includes the maximum in the last class', () => {
    const result = buildThematic(data, { mode: 'CHOROPLETH', method: 2, classes: 2,
      colorScale: '#111111,#222222', noDataColor: '#eeeeee' });
    expect(result.classes.map(item => [item.min, item.max])).toEqual([[0, 5], [5, 10]]);
    expect(result.counts).toMatchObject({ zero: 1, value: 1, 'missing-value': 1,
      'missing-geometry': 1, unclassified: 0 });
    expect(result.missingGeometry).toEqual(['no-geometry']);
    expect(result.features.features.map(feature => feature.properties?.['color']))
      .toEqual(['#111111', '#222222', '#eeeeee']);
  });
  it('uses predefined intervals and identifies outside-class values without turning them into no-data', () => {
    const result = buildThematic(data, { mode: 'CHOROPLETH', method: 1,
      legendSet: { id: 'verified', name: 'Verified', legends: [
        { id: 'a', name: '1–5', color: '#123456', startValue: 1, endValue: 5 },
      ] }, unclassifiedColor: '#999999' });
    expect(result.features.features[0].properties).toMatchObject({ value: 0,
      valueState: 'unclassified', color: '#999999' });
    expect(result.counts.unclassified).toBe(2);
  });
  it('draws bubble symbols at valid representative points and bounds linear radius', () => {
    const result = buildThematic(data, { mode: 'BUBBLE', method: 10,
      colorScale: '#558cc0', radiusLow: 5, radiusHigh: 30 });
    expect(result.features.features[0].geometry.type).toBe('Point');
    expect(result.features.features[0].properties).toMatchObject({ valueState: 'zero', radius: 5 });
    expect(result.features.features[1].properties).toMatchObject({ radius: 30 });
    expect(result.legendSet.legends.map(item => item.id)).toEqual(['single-color', 'no-data']);
    expect(thematicMapboxStyle('BUBBLE', 0.8)).toMatchObject({ type: 'circle', paint: {
      'circle-radius': ['get', 'radius'], 'circle-opacity': 0.8 } });
    expect(thematicMapboxStyle('CHOROPLETH', 0.5)).toMatchObject({ type: 'fill', paint: {
      'fill-color': ['get', 'color'], 'fill-opacity': 0.5 } });
  });
  it('rejects unsupported methods, wrong geometry, invalid intervals and radius limits', () => {
    expect(() => thematicClasses(data, { mode: 'CHOROPLETH', method: 3,
      classes: 2, colorScale: '#111,#222' })).not.toThrow();
    expect(() => buildThematic(data, { mode: 'CHOROPLETH', method: 10,
      colorScale: '#111' })).toThrow('bubble-only');
    expect(() => buildThematic(data, { mode: 'BUBBLE', method: 10,
      colorScale: '#111', radiusLow: 31, radiusHigh: 30 })).toThrow('radius limits');
    expect(() => buildThematic([{ ...data[0], value: -1 }], { mode: 'BUBBLE',
      method: 10, colorScale: '#111' })).toThrow('non-negative');
    expect(buildThematic([{ id: 'point', name: 'Point', value: 1,
      geometry: { type: 'Point', coordinates: [35, -6] } }], { mode: 'CHOROPLETH',
      method: 2, classes: 1, colorScale: '#111' }).missingGeometry).toEqual(['point']);
  });
  it('keeps a constant zero dataset in one deterministic class and rejects invalid coordinates', () => {
    const constant = buildThematic(data.slice(0, 1), { mode: 'CHOROPLETH', method: 2,
      classes: 2, colorScale: '#111111,#222222' });
    expect(constant.features.features[0].properties).toMatchObject({ valueState: 'zero', color: '#111111' });
    expect(joinThematicData([geo('invalid', '[181,-6]'), geo('swapped', '[35,91]')],
      { rows: [] }).map(item => item.geometry)).toEqual([null, null]);
  });
  it('classifies equal counts deterministically and keeps tied values together', () => {
    const values = [0, 0, 1, 2, 3, 4].map((value, index) => ({
      ...data[0], id: String(index), value,
    }));
    const result = buildThematic(values, { mode: 'CHOROPLETH', method: 3,
      classes: 3, colorScale: '#111111,#222222,#333333' });
    expect(result.features.features.map(feature => feature.properties?.['color']))
      .toEqual(['#111111', '#111111', '#222222', '#222222', '#333333', '#333333']);
    expect(result.counts).toMatchObject({ zero: 2, value: 4, unclassified: 0 });
  });
  it('accepts a valid DHIS2 multi-polygon geometry for thematic overlays', () => {
    const co = JSON.stringify([[[[35,-6],[36,-6],[36,-7],[35,-7],[35,-6]]]]);
    const joined = joinThematicData([geo('ou-a', co)], mapAnalyticsFixture());
    expect(joined[0].geometry?.type).toBe('MultiPolygon');
    const result = buildThematic(joined, { mode: 'CHOROPLETH', method: 2,
      classes: 1, colorScale: '#2266aa' });
    expect(result.features.features[0].geometry.type).toBe('MultiPolygon');
  });
});
