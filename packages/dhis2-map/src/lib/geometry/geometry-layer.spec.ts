import { buildGeometryLayer, parseGeometry } from './geometry-layer';
import type { MapGeoFeature } from '../models/map-geo-feature.model';

const geo = (id: string, co: string, dimensions?: object): MapGeoFeature =>
  ({ id, na: `Area ${id}`, co, ty: 1, dimensions } as MapGeoFeature);
const point = '[35,-6]';
const polygon = '[[[35,-6],[36,-6],[36,-7],[35,-6]]]';

describe('geometry-only facility and OU layers', () => {
  it('validates point and polygon coordinates and counts missing geometry', () => {
    expect(parseGeometry('[181,-6]')).toBeNull();
    expect(parseGeometry('[[[35,-6],[36,-6],[36,-7]]]')).toBeNull();
    const result = buildGeometryLayer([geo('point', point), geo('polygon', polygon),
      geo('bad', '[]')], { kind: 'orgUnit' });
    expect(result.features.map(item => item.geometry.type)).toEqual(['Point', 'Polygon']);
    expect(result.missingGeometryIds).toEqual(['bad']);
  });
  it('keeps actual associated geometry distinct from straight-line buffers', () => {
    const result = buildGeometryLayer([geo('facility', point), geo('catchment', polygon)],
      { kind: 'facility', areaRadius: 5000 });
    expect(result.features.map(item => item.properties?.['geometryKind']))
      .toEqual(['point', 'straight-line-buffer', 'associated-geometry']);
    expect(result.features[1].properties?.['radiusMetres']).toBe(5000);
    expect(result.bufferCount).toBe(1);
  });
  it('applies only validated colours and never copies HTML into style values', () => {
    const result = buildGeometryLayer([geo('a', point, { group: 'g1' })],
      { kind: 'facility', color: '#112233', groupColors: { g1: '#abcdef' } });
    expect(result.features[0].properties?.['color']).toBe('#abcdef');
    expect(() => buildGeometryLayer([], { kind: 'facility', color: 'url(javascript:evil)' }))
      .toThrow('Invalid geometry layer color');
  });
});
