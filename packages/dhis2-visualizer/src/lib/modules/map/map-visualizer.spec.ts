import {
  MapLayer as DirectMapLayer,
  MapVisualizer as DirectMapVisualizer,
} from '@iapps/d2-maps';
import { MapLayer } from './layers/map-layer.model';
import { MapVisualizer } from './map-visualizer';

describe('map facade compatibility', () => {
  it('keeps legacy renderer and layer imports equivalent to direct module exports', () => {
    expect(MapVisualizer).toBe(DirectMapVisualizer);
    expect(MapLayer).toBe(DirectMapLayer);
  });
});
