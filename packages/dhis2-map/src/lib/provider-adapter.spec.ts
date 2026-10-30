import { DefaultMapProviderAdapter } from './provider-adapter';
import { Map } from 'maplibre-gl';

describe('MapLibre provider boundary', () => {
  it('constructs the open provider without forwarding a legacy Mapbox token', () => {
    const adapter = new DefaultMapProviderAdapter();
    adapter.createMap({ container: 'map-host', style: { version: 8, sources: {}, layers: [] }, accessToken: 'legacy-token' });
    expect((Map as unknown as { latestOptions: unknown }).latestOptions).toEqual({
      container: 'map-host', style: { version: 8, sources: {}, layers: [] },
    });
  });

  it('rejects proprietary mapbox:// styles with a migration message', () => {
    expect(() => new DefaultMapProviderAdapter().createMap({
      container: 'map-host', style: 'mapbox://styles/mapbox/light-v10',
    })).toThrow('Mapbox style URLs are not supported by MapLibre');
  });
});
