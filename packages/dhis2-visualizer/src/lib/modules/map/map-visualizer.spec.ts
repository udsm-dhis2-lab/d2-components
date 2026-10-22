import { geoJsonFixture } from '../../../testing/fixtures/visualizer.fixtures';
import { MapLayer } from './layers/map-layer.model';
import { MapVisualizer } from './map-visualizer';

describe('MapVisualizer', () => {
  it('loads layers, fits their first collection and registers provider load', async () => {
    document.body.innerHTML = '<div id="map-host"></div>';
    const geoJson = geoJsonFixture();
    const layer = new MapLayer({
      id: 'layer-a',
      fillType: 'fill',
      features: geoJson.features as never,
    });
    jest.spyOn(layer, 'loadFeatures').mockResolvedValue(undefined);
    const renderer = new MapVisualizer().setId('map-host') as MapVisualizer;
    renderer.addLayer(layer);

    await renderer.draw();

    expect(renderer.map).toBeDefined();
    expect(renderer.map.fitBounds).toHaveBeenCalledWith([0, 0, 10, 10], {
      padding: 40,
    });
    expect(renderer.map.on).toHaveBeenCalledWith('load', expect.any(Function));
  });

  it('filters point coordinates outside the latitude range', () => {
    const renderer = new MapVisualizer();
    const features = [
      { geometry: { coordinates: [35, -6] } },
      { geometry: { coordinates: [35, 100] } },
    ];

    expect(renderer.getValidFeatures(features)).toEqual([features[0]]);
  });

  it('removes the active provider map during disposal', () => {
    const renderer = new MapVisualizer();
    const remove = jest.fn();
    renderer.map = { remove };

    renderer.dispose();

    expect(remove).toHaveBeenCalledTimes(1);
    expect(renderer.map).toBeNull();
  });
});
