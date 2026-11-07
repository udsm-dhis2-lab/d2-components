import { legacySavedMapFixture, mapViews } from '../testing/fixtures/map-characterization.fixtures';
import { parseSavedMap, serializeSavedMap, toMapLayerRequest } from './saved-map-boundary';
import { D2Maps } from './map-visualizer';
import { MapLayer } from './layers/map-layer.model';

describe('deferred Earth Engine boundary',()=>{
  it('retains encoded selections without promoting dataset IDs into executable sources',()=>{
    const raw = {...legacySavedMapFixture(),mapViews:[mapViews.earthEngine]};
    const parsed = parseSavedMap(raw,'2.41.3');
    expect(parsed.layers[0].config).toMatchObject({id:'approved-source-a',band:'band-a',
      aggregationType:['mean']});
    expect(toMapLayerRequest(parsed.layers[0])).toMatchObject({kind:'unsupported',
      originalKind:'earthEngine'});
    expect(serializeSavedMap(parsed)).toEqual(raw);
  });
  it('does not request geometry, analytics or provider resources for an unverified EE layer',async()=>{
    const source = {loadGeoFeatures:jest.fn(),loadAnalytics:jest.fn()};
    const provider = {createMap:jest.fn(),createNavigationControl:jest.fn(),
      createStyleSwitcherControl:jest.fn()};
    const renderer = new D2Maps(provider).setId('host') as D2Maps;
    renderer.addLayer(new MapLayer({id:'ee-a',layer:'earthEngine' as never,
      config:mapViews.earthEngine.config},source));
    await expect(renderer.draw()).rejects.toThrow('Unable to load map layers');
    expect(renderer.layerFailures[0].error).toEqual(expect.objectContaining({
      message:expect.stringContaining('Earth Engine layer deferred')}));
    expect(source.loadGeoFeatures).not.toHaveBeenCalled();
    expect(source.loadAnalytics).not.toHaveBeenCalled();
    expect(provider.createMap).not.toHaveBeenCalled();
  });
  it('reports an EE failure without discarding a valid mixed geometry layer',async()=>{
    const source = {loadGeoFeatures:jest.fn().mockResolvedValue([]),loadAnalytics:jest.fn()};
    const renderer = new D2Maps().setId('host') as D2Maps;
    renderer.addLayer(new MapLayer({id:'facility-a',layer:'facility'},source));
    renderer.addLayer(new MapLayer({id:'ee-a',layer:'earthEngine' as never},source));
    expect((await renderer.loadLayers()).map(layer=>layer.id)).toEqual(['facility-a']);
    expect(renderer.layerFailures.map(item=>item.layerId)).toEqual(['ee-a']);
    expect(source.loadGeoFeatures).toHaveBeenCalledTimes(1);
    expect(source.loadAnalytics).not.toHaveBeenCalled();
  });
});
