import type { Feature } from 'geojson';
import { MapLayer } from './layers/map-layer.model';
import { D2Maps, MapVisualizer } from './map-visualizer';
import type { MapProviderAdapter, ProviderMap } from './provider-adapter';
import type { MapGeoFeature } from './models/map-geo-feature.model';

class FakeMap implements ProviderMap {
  listener?: () => void;
  once = jest.fn((_event, listener) => {
    this.listener = listener;
  });
  off = jest.fn();
  addSource = jest.fn();
  addLayer = jest.fn();
  addControl = jest.fn();
  removeControl = jest.fn();
  fitBounds = jest.fn();
  remove = jest.fn();
}
const provider = (map: FakeMap): MapProviderAdapter => ({
  createMap: jest.fn(() => map),
  createNavigationControl: jest.fn(() => ({})),
  createStyleSwitcherControl: jest.fn(() => ({})),
});
const feature = (x: number, y: number): Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'Point', coordinates: [x, y] },
});
const layer = (id: string, features: Feature[]) => {
  const value = new MapLayer({
    id,
    fillType: 'circle',
    features: features as never,
  });
  jest.spyOn(value, 'loadFeatures').mockResolvedValue(undefined);
  return value;
};
async function ready(map: FakeMap, drawing: Promise<void>): Promise<void> {
  while (!map.listener) await Promise.resolve();
  map.listener?.();
  await drawing;
}

describe('MapVisualizer', () => {
  it('renders mixed thematic, facility and legacy boundary layers in stable order without geometry analytics', async () => {
    const map = new FakeMap();
    const point = { id: 'facility-a', na: 'Clinic A', co: '[35,-6]', ty: 1 } as MapGeoFeature;
    const polygon = { id: 'ou-a', na: 'Area A',
      co: '[[[35,-6],[36,-6],[36,-7],[35,-6]]]', ty: 2 } as MapGeoFeature;
    const facilitySource = { loadGeoFeatures: jest.fn().mockResolvedValue([point]),
      loadAnalytics: jest.fn().mockRejectedValue(new Error('must not request analytics')) };
    const boundarySource = { loadGeoFeatures: jest.fn().mockResolvedValue([polygon]),
      loadAnalytics: jest.fn().mockRejectedValue(new Error('must not request analytics')) };
    const facility = new MapLayer({ id: 'facility', layer: 'facility', sortOrder: 1,
      areaRadius: 5000, labels: true, config: '{"opacity":0.7}' }, facilitySource);
    const boundary = new MapLayer({ id: 'boundary', layer: 'boundary', sortOrder: 2,
      organisationUnitColor: '#334455', labels: true }, boundarySource);
    const thematic = layer('thematic', [feature(35, -6)]);
    thematic.layer = 'thematic'; thematic.sortOrder = 0;
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.setProviderConfig({ style: 'provider-style' }).addLayer(boundary)
      .addLayer(facility).addLayer(thematic);
    await ready(map, renderer.draw());
    expect(facilitySource.loadAnalytics).not.toHaveBeenCalled();
    expect(boundarySource.loadAnalytics).not.toHaveBeenCalled();
    expect(facility.bufferCount).toBe(1);
    expect(map.addSource.mock.calls.map(([id]) => id)).toEqual([
      'thematic-source', 'facility-source', 'boundary-source',
    ]);
    expect(map.addLayer.mock.calls.map(([item]) => item.id)).toContain('facility-buffer');
    expect(map.addLayer.mock.calls.map(([item]) => item.id)).toContain('boundary-labels');
    expect(map.addLayer.mock.calls.find(([item]) => item.id === 'boundary')?.[0].paint)
      .toMatchObject({ 'line-color': ['get', 'color'] });
    renderer.dispose();
    expect(map.remove).toHaveBeenCalledTimes(1);
  });
  it('omits hidden geometry layers from provider output and retains the next visible layer', async () => {
    const map = new FakeMap();
    const source = { loadGeoFeatures: jest.fn().mockResolvedValue([
      { id: 'ou-a', na: '<b>Plain text</b>', co: '[35,-6]', ty: 1 } as MapGeoFeature,
    ]), loadAnalytics: jest.fn() };
    const hidden = new MapLayer({ id: 'hidden', layer: 'facility', hidden: true }, source);
    const visible = new MapLayer({ id: 'visible', layer: 'facility', labels: true }, source);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(hidden).addLayer(visible);
    await ready(map, renderer.draw());
    expect(map.addSource.mock.calls.map(([id]) => id)).toEqual(['visible-source']);
    expect(source.loadAnalytics).not.toHaveBeenCalled();
    expect(visible.features[0].properties?.['name']).toBe('<b>Plain text</b>');
    expect(map.addLayer.mock.calls.map(([item]) => item.id)).not.toContain('visible-labels');
  });
  it('renders only used validated facility group colours in an accessible legend', async () => {
    const map = new FakeMap();
    const source = { loadGeoFeatures: jest.fn().mockResolvedValue([
      { id: 'ou-a', na: 'Clinic A', co: '[35,-6]', ty: 1,
        dimensions: { group: 'hospital' } } as MapGeoFeature,
    ]), loadAnalytics: jest.fn() };
    const facility = new MapLayer({ id: 'grouped', layer: 'facility',
      groupColors: { hospital: '#225588', unused: '#000000', unsafe: 'red' } }, source);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(facility);
    await ready(map, renderer.draw());
    expect(facility.features[0].properties?.['color']).toBe('#225588');
    expect(facility.legendSet.legends).toEqual([
      { id: 'hospital', name: 'hospital', color: '#225588', startValue: 0, endValue: 0 },
    ]);
    expect(map.addControl).toHaveBeenCalled();
  });
  it('provides valid circle paint and layout for DHIS2 point geometries', () => {
    const points = new MapLayer({ id: 'points', layer: 'thematic1',
      features: [feature(35, -6)] });
    points.setFillType();
    expect(points.fillType).toBe('circle');
    expect(points.layout).toEqual({});
    expect(points.paint).toMatchObject({ 'circle-color': ['get', 'color'] });
  });
  it('keeps MapVisualizer as an alias of the D2Maps public class', () => {
    expect(MapVisualizer).toBe(D2Maps);
  });
  it('waits for readiness, preserves order and fits every valid layer', async () => {
    const map = new FakeMap();
    const renderer = new MapVisualizer(provider(map)).setId(
      'host'
    ) as MapVisualizer;
    renderer
      .setProviderConfig({ style: 'provider-style' })
      .addLayer(layer('a', [feature(0, 0)]))
      .addLayer(layer('b', [feature(10, 10)]));
    const drawing = renderer.draw();
    while (!map.listener) await Promise.resolve();
    expect(map.addSource).not.toHaveBeenCalled();
    map.listener?.();
    await drawing;
    expect(map.fitBounds).toHaveBeenCalledWith([0, 0, 10, 10], { padding: 40 });
    expect(map.addSource.mock.calls.map(([id]) => id)).toEqual([
      'a-source',
      'b-source',
    ]);
  });

  it('renders overlays on a credential-free blank style when no provider style is supplied', async () => {
    const map = new FakeMap();
    const adapter = provider(map);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.addLayer(layer('overlay', [feature(35, -6)]));
    await ready(map, renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledWith(expect.objectContaining({
      style: { version: 8, sources: {}, layers: [] },
    }));
    expect(adapter.createStyleSwitcherControl).not.toHaveBeenCalled();
    expect(map.addSource).toHaveBeenCalledWith('overlay-source', expect.any(Object));
    expect(map.addLayer.mock.calls.map(([item]) => item.id)).toEqual(['overlay']);
    renderer.dispose();
  });

  it('surfaces a total layer-load failure instead of leaving a blank map card', async () => {
    const map = new FakeMap();
    const failed = layer('failed', []);
    jest.spyOn(failed, 'loadFeatures').mockRejectedValue(new Error('offline'));
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(failed);
    await expect(renderer.draw()).rejects.toThrow('Unable to load map layers: failed');
    expect(renderer.layerFailures).toMatchObject([{ layerId: 'failed' }]);
    expect(map.addSource).not.toHaveBeenCalled();
  });

  it('retains the historical generic rendering path for an unregistered saved layer', async () => {
    const map = new FakeMap();
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    const generic = layer('historical', [feature(1, 2)]);
    generic.layer = 'facility' as never;
    renderer.setProviderConfig({ style: 'provider-style' }).addLayer(generic);
    await ready(map, renderer.draw());
    expect(map.addSource).toHaveBeenCalledWith('historical-source', expect.any(Object));
    renderer.dispose();
  });

  it.each(['CHOROPLETH', 'BUBBLE'] as const)('renders %s thematic mode through the provider adapter', async mode => {
    const map = new FakeMap();
    const coordinates = JSON.stringify([[[35,-6],[36,-6],[36,-7],[35,-7],[35,-6]]]);
    const thematic = new MapLayer({ id: 'thematic-a', layer: 'thematic', thematicMapType: mode,
      method: mode === 'BUBBLE' ? 10 : 2, classes: 2,
      colorScale: mode === 'BUBBLE' ? '#558cc0' : '#111111,#222222',
      dataSelections: [{ dimension: 'ou', items: [{ id: 'ou-a' }] }],
      config: JSON.stringify({ noDataLegend: { color: '#eeeeee' } }) }, {
      loadGeoFeatures: jest.fn().mockResolvedValue([{ id: 'ou-a', na: 'Area A', co: coordinates, ty: 2 } as MapGeoFeature]),
      loadAnalytics: jest.fn().mockResolvedValue({ headers: [{ name: 'value' }, { name: 'ou' }],
        rows: [['0', 'ou-a']] }),
    });
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.setProviderConfig({ style: 'provider-style' }).addLayer(thematic);
    await ready(map, renderer.draw());
    expect(map.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'thematic-a',
      type: mode === 'BUBBLE' ? 'circle' : 'fill', paint: expect.objectContaining(
        mode === 'BUBBLE' ? { 'circle-radius': ['get', 'radius'] } : { 'fill-color': ['get', 'color'] }) }));
    expect((map.addSource as jest.Mock).mock.calls[0][1].data.features[0].properties)
      .toMatchObject({ value: 0, valueState: 'zero' });
    renderer.dispose();
  });

  it('does not fit bounds for empty or invalid collections', async () => {
    const map = new FakeMap();
    const renderer = new MapVisualizer(provider(map)).setId(
      'host'
    ) as MapVisualizer;
    renderer
      .setProviderConfig({ style: 'provider-style' })
      .addLayer(layer('empty', [feature(0, 100)]));
    await ready(map, renderer.draw());
    expect(map.fitBounds).not.toHaveBeenCalled();
  });

  it('renders successful layers and records individual failures', async () => {
    const map = new FakeMap();
    const failed = layer('failed', []);
    jest.spyOn(failed, 'loadFeatures').mockRejectedValue(new Error('offline'));
    const renderer = new MapVisualizer(provider(map)).setId(
      'host'
    ) as MapVisualizer;
    renderer
      .setProviderConfig({ style: 'provider-style' })
      .addLayer(failed)
      .addLayer(layer('ok', [feature(1, 2)]));
    await ready(map, renderer.draw());
    expect(renderer.layers.map(({ id }) => id)).toEqual(['failed', 'ok']);
    expect(map.addSource.mock.calls.map(([id]) => id)).toEqual(['ok-source']);
    expect(renderer.layerFailures).toMatchObject([{ layerId: 'failed' }]);
  });

  it('retries a failed configured layer on the next draw without changing its order', async () => {
    const first = new FakeMap();
    const second = new FakeMap();
    const adapter: MapProviderAdapter = { createMap: jest.fn().mockReturnValueOnce(first).mockReturnValueOnce(second),
      createNavigationControl: jest.fn(() => ({})), createStyleSwitcherControl: jest.fn(() => ({})) };
    const transient = layer('transient', [feature(1, 2)]);
    jest.spyOn(transient, 'loadFeatures').mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.setProviderConfig({ style: 'provider-style' }).addLayer(transient)
      .addLayer(layer('stable', [feature(3, 4)]));
    await ready(first, renderer.draw());
    expect(first.addSource.mock.calls.map(([id]) => id)).toEqual(['stable-source']);
    await ready(second, renderer.draw());
    expect(second.addSource.mock.calls.map(([id]) => id)).toEqual(['transient-source', 'stable-source']);
    expect(renderer.layerFailures).toEqual([]);
    renderer.dispose();
  });

  it('continues when the provider rejects one rendered layer', async () => {
    const map = new FakeMap();
    map.addSource.mockImplementationOnce(() => {
      throw new Error('invalid provider layer');
    });
    const renderer = new MapVisualizer(provider(map)).setId(
      'host'
    ) as MapVisualizer;
    renderer
      .setProviderConfig({ style: 'provider-style' })
      .addLayer(layer('invalid', [feature(0, 0)]))
      .addLayer(layer('valid', [feature(1, 2)]));
    await ready(map, renderer.draw());
    expect(renderer.layerFailures).toMatchObject([{ layerId: 'invalid' }]);
    expect(map.addSource).toHaveBeenLastCalledWith(
      'valid-source',
      expect.any(Object)
    );
  });

  it('disposes callbacks, controls and provider resources', async () => {
    const map = new FakeMap();
    const renderer = new MapVisualizer(provider(map)).setId(
      'host'
    ) as MapVisualizer;
    renderer
      .setProviderConfig({ style: 'provider-style' })
      .addLayer(layer('a', [feature(0, 0)]));
    await ready(map, renderer.draw());
    renderer.dispose();
    expect(map.off).toHaveBeenCalledWith('load', expect.any(Function));
    expect(map.removeControl).toHaveBeenCalled();
    expect(map.remove).toHaveBeenCalledTimes(1);
    expect(renderer.map).toBeNull();
  });

  it('replaces the provider on a repeated draw and retains loaded layer order', async () => {
    const first = new FakeMap();
    const second = new FakeMap();
    const adapter: MapProviderAdapter = {
      createMap: jest.fn().mockReturnValueOnce(first).mockReturnValueOnce(second),
      createNavigationControl: jest.fn(() => ({})),
      createStyleSwitcherControl: jest.fn(() => ({})),
    };
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.setProviderConfig({ style: 'provider-style' }).setZoom(7)
      .addLayer(layer('first', [feature(35, -6)]))
      .addLayer(layer('second', [feature(36, -7)]));
    await ready(first, renderer.draw());
    await ready(second, renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledTimes(2);
    expect((adapter.createMap as jest.Mock).mock.calls.map(([options]) => options.zoom)).toEqual([7, 7]);
    expect(first.remove).toHaveBeenCalledTimes(1);
    expect(first.removeControl).toHaveBeenCalledTimes(first.addControl.mock.calls.length);
    expect(second.addSource.mock.calls.map(([id]) => id)).toEqual(['first-source', 'second-source']);
    renderer.dispose();
    expect(second.remove).toHaveBeenCalledTimes(1);
  });

  it('rejects stale asynchronous loads before constructing a provider', async () => {
    const map = new FakeMap();
    const adapter = provider(map);
    const delayed = layer('delayed', [feature(1, 2)]);
    let finishOld!: () => void;
    jest.spyOn(delayed, 'loadFeatures')
      .mockImplementationOnce(() => new Promise<void>(resolve => { finishOld = resolve; }))
      .mockResolvedValueOnce(undefined);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.setProviderConfig({ style: 'provider-style' }).addLayer(delayed);
    const oldDraw = renderer.draw();
    await Promise.resolve();
    const newDraw = renderer.draw();
    await ready(map, newDraw);
    finishOld();
    await oldDraw;
    expect(adapter.createMap).toHaveBeenCalledTimes(1);
    expect(map.addSource).toHaveBeenCalledTimes(1);
    renderer.dispose();
  });

  it('keeps current control and blank-basemap flags observable', async () => {
    const map = new FakeMap();
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.setLayerConfig({ hideBasemap: true, hideNavigationControls: true,
      hideStyleSwitcher: true, hideLegendControl: true });
    await ready(map, renderer.draw());
    expect((renderer.map as FakeMap)).toBe(map);
    expect(map.addControl).not.toHaveBeenCalled();
    expect((map.addSource as jest.Mock).mock.calls).toHaveLength(0);
    renderer.dispose();
  });

  it('does not bundle or invent a credential for the blank style', async () => {
    const map = new FakeMap();
    const adapter = provider(map);
    const renderer = new MapVisualizer(adapter).setId('host') as MapVisualizer;
    await ready(map, renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledWith(expect.objectContaining({ accessToken: undefined }));
    renderer.dispose();
  });
});
