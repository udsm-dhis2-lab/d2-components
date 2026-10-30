import { legacySavedMapFixture, modernSavedMapFixture } from '../testing/fixtures/map-characterization.fixtures';
import { parseSavedMap, serializeSavedMap, toMapLayerRequest } from './saved-map-boundary';
import { MapLayerRegistry } from './layer-registry';

describe('versioned saved-map boundary', () => {
  it.each([['2.41.3', legacySavedMapFixture()], ['2.43', modernSavedMapFixture()]] as const)(
    'round-trips %s without losing unknown fields', (version, fixture) => {
      const input = { ...fixture, safeUnknown: { note: 'retained' } };
      const request = parseSavedMap(input, version);
      expect(request.layers.map(layer => layer.id)).toEqual(['view-thematic', 'view-facility']);
      expect(request.layers[0].config).toMatchObject({ legendDecimalPlaces: 1 });
      expect(toMapLayerRequest(request.layers[0]).kind).toBe('thematic');
      expect(toMapLayerRequest(request.layers[1])).toMatchObject({ kind: 'unsupported', originalKind: 'facility' });
      expect(serializeSavedMap(request)).toEqual(input);
    }
  );
  it('normalizes legacy boundary without rewriting the saved layer', () => {
    const request = parseSavedMap({ ...legacySavedMapFixture(),
      mapViews: [{ id: 'boundary-a', layer: 'boundary', config: '{"label":true}' }] }, '2.41.3');
    expect(request.layers[0].layer).toBe('boundary');
    expect(serializeSavedMap(request).mapViews).toEqual([{ id: 'boundary-a', layer: 'boundary', config: '{"label":true}' }]);
  });
  it('rejects malformed encoded objects and missing versioned basemaps', () => {
    expect(() => parseSavedMap({ ...legacySavedMapFixture(), mapViews: [
      { id: 'bad', layer: 'thematic', config: '{bad' }] }, '2.41.3')).toThrow('config');
    expect(() => parseSavedMap(legacySavedMapFixture(), '2.43')).toThrow('basemaps');
  });
  it('rejects unregistered definitions without loading a provider', () => {
    expect(() => new MapLayerRegistry().resolve('event')).toThrow('Unsupported map layer definition: event');
  });
});
