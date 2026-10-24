import {
  D2Maps as DirectD2Maps,
  MapLayer as DirectMapLayer,
  MapVisualizer as DirectMapVisualizer,
} from '@iapps/d2-maps';
import { MapLayer } from './layers/map-layer.model';
import { D2Maps, MapVisualizer } from './map-visualizer';

describe('map facade compatibility', () => {
  it('keeps legacy renderer and layer imports equivalent to direct module exports', () => {
    expect(MapVisualizer).toBe(DirectMapVisualizer);
    expect(D2Maps).toBe(DirectD2Maps);
    expect(D2Maps).toBe(MapVisualizer);
    expect(MapLayer).toBe(DirectMapLayer);
  });
});
