import type { Feature } from 'geojson';
import { MapLayer } from './layers/map-layer.model';
import { MapVisualizer } from './map-visualizer';
import type { MapProviderAdapter, ProviderMap } from './provider-adapter';

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
    expect(renderer.layers.map(({ id }) => id)).toEqual(['ok']);
    expect(renderer.layerFailures).toMatchObject([{ layerId: 'failed' }]);
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

  it('requires external provider configuration', async () => {
    await expect(
      new MapVisualizer(provider(new FakeMap())).draw()
    ).rejects.toThrow('provider configuration');
  });
});
