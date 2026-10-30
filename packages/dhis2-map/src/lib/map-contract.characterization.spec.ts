import { D2Maps } from './map-visualizer';
import { MapLayer } from './layers/map-layer.model';
import { GeoJSONUtil } from './utils/geo-json.util';
import { MapGeometryUtil } from './utils/map-geometry.util';
import type { MapGeoFeature } from './models/map-geo-feature.model';
import { legacySavedMapFixture, modernSavedMapFixture, mapViews,
  mapGeoFeaturesFixture, mapAnalyticsFixture } from '../testing/fixtures/map-characterization.fixtures';
import { MapVisualizer } from '../index';
import type { MapDataSource } from './map-data-source';

describe('Sprint 21 catalogue-shaped fixtures and current map behavior', () => {
  it('retains encoded configs and version-distinct basemap payloads in fixtures', () => {
    const legacy = legacySavedMapFixture();
    const modern = modernSavedMapFixture();
    expect(typeof legacy.basemap).toBe('string');
    expect(JSON.parse(legacy.basemap)).toEqual({ id: 'osmLight', opacity: 1, hidden: false });
    expect(modern.basemaps).toEqual([{ id: 'osmLight', opacity: 1, hidden: false }]);
    expect(modern).not.toHaveProperty('basemap');
    expect(legacy.mapViews.map(view => view.layer)).toEqual(['thematic', 'facility']);
    expect(typeof mapViews.trackedEntity.config).toBe('string');
    expect(JSON.parse(mapViews.earthEngine.config).aggregationType).toEqual(['mean']);
    expect(JSON.parse(mapViews.external.config).type).toBe('wmsLayer');
    expect(mapViews.event.eventCoordinateField).toBe('psigeometry');
    expect(mapViews.bubble.thematicMapType).toBe('BUBBLE');
    expect(mapViews.orgUnit.layer).toBe('orgUnit');
  });

  it('keeps the direct class alias and its layer API available', () => {
    expect(MapVisualizer).toBe(D2Maps);
    expect(new D2Maps().addLayer(new MapLayer({ id: 'a' })).layers.map(layer => layer.id))
      .toEqual(['a']);
  });

  it('loads geometry and analytics independently, joining a positive value by OU ID', async () => {
    const loadGeoFeatures = jest.fn().mockResolvedValue(mapGeoFeaturesFixture().slice(0, 2));
    const loadAnalytics = jest.fn().mockResolvedValue(mapAnalyticsFixture());
    const dataSource = { loadGeoFeatures, loadAnalytics } as MapDataSource;
    const layer = new MapLayer({ id: 'view-a', layer: 'thematic',
      legendSet: { id: 'legend-a', name: 'Values', legends: [
        { id: 'low', name: 'Low', startValue: 0, endValue: 10, color: '#eeeeee' },
        { id: 'high', name: 'High', startValue: 10, endValue: 20, color: '#2266aa' },
      ] }, dataSelections: [{ dimension: 'ou', items: [{ id: 'ou-a' }, { id: 'ou-b' }] }] }, dataSource);
    await layer.loadFeatures();
    expect(loadGeoFeatures).toHaveBeenCalledTimes(1);
    expect(loadAnalytics).toHaveBeenCalledTimes(1);
    expect(layer.featureCollection.features[0]).toMatchObject({
      properties: { value: 12, color: '#2266aa', name: 'Area A' },
    });
    expect(layer.featureCollection.features.map(feature => feature.geometry.type)).toEqual(['Point', 'Point']);
  });

  it('keeps absent and zero inputs distinct in the fixture, without asserting the current defective output', () => {
    const data = mapAnalyticsFixture();
    expect(data.rows.find(row => row.ou.id === 'ou-b')?.value).toBe(0);
    expect(data.rows.some(row => row.ou.id === 'ou-missing')).toBe(false);
    expect(GeoJSONUtil.getPropertyValue(data, 'ou-a')).toBe(12);
  });
  it('colours a legacy equal-count thematic view without an embedded palette', async () => {
    const polygon = JSON.stringify([[[35,-6],[36,-6],[36,-7],[35,-7],[35,-6]]]);
    const source: MapDataSource = {
      loadGeoFeatures: async () => [
        { id: 'ou-a', na: 'Area A', co: polygon, ty: 2 } as MapGeoFeature,
        { id: 'ou-b', na: 'Area B', co: polygon, ty: 2 } as MapGeoFeature,
      ],
      loadAnalytics: async () => ({ rows: [
        { ou: { id: 'ou-a' }, value: 0 },
        { ou: { id: 'ou-b' }, value: 12 },
      ] }),
    };
    const layer = new MapLayer({ id: 'legacy-equal-count', layer: 'thematic1',
      method: 3, classes: 5 }, source);
    await layer.loadFeatures();
    expect(layer.features.map(feature => feature.properties?.['value'])).toEqual([0, 12]);
    expect(layer.features.map(feature => feature.properties?.['color']))
      .not.toContain('#f5f5f5');
    expect(layer.legendSet.legends.length).toBeGreaterThan(0);
  });

  it('preserves valid zero separately from absent/null data in generated features', () => {
    const polygon = [[[0, 0], [1, 0], [1, 1], [0, 0]]];
    const multiPolygon = [polygon, [[[2, 2], [3, 2], [3, 3], [2, 2]]]];
    expect(MapGeometryUtil.determineGeometryType(polygon)).toBe('Polygon');
    expect(MapGeometryUtil.determineGeometryType(multiPolygon)).toBe('MultiPolygon');
    const feature = GeoJSONUtil.getGeoJSON(
      { ...mapGeoFeaturesFixture()[0], id: 'ou-a', co: JSON.stringify(multiPolygon), na: 'Area A', ty: 2 } as MapGeoFeature,
      { rows: [{ ou: { id: 'ou-a' }, value: 0 }] },
      { legends: [] } as any, 'orgUnit'
    );
    expect(feature?.toObject().geometry).toMatchObject({ type: 'MultiLineString', coordinates: [polygon[0], multiPolygon[1][0]] });
    expect(feature?.toObject().properties.value).toBe(0);
    expect(GeoJSONUtil.getPropertyValue({ rows: [] }, 'ou-a')).toBeNull();
  });
  it.todo('rejects a stale load when a second draw starts');
  it.todo('parses and round-trips legacy and Core 2.43 saved-map basemaps');
  it.todo('dispatches catalogue event, facility, external and Earth Engine families by explicit contracts');
  it.todo('downloads the rendered map through a supported public format');
});
