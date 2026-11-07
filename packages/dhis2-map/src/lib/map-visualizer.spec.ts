import type { Feature } from 'geojson';
import { MapLayer } from './layers/map-layer.model';
import { D2Maps, MapVisualizer } from './map-visualizer';
import { LegendControl } from './models/legend-control.model';
import { TrackedEntityMapLayer } from './layers/tracker/tracker-map-layer';
import type { MapProviderAdapter, ProviderMap } from './provider-adapter';
import type { MapGeoFeature } from './models/map-geo-feature.model';
import { ExternalSourceRegistry } from './external-sources';

class FakeMap implements ProviderMap {
  listener?: () => void;
  moveListener?: () => void;
  currentZoom = 8;
  geoJsonSource = {setData:jest.fn()};
  once = jest.fn((_event, listener) => {
    this.listener = listener;
  });
  off = jest.fn();
  on = jest.fn((_event, listener) => { this.moveListener = listener; });
  getZoom = jest.fn(() => this.currentZoom);
  getBounds = jest.fn(() => ({getWest:()=>-14,getSouth:()=>6,getEast:()=>-10,getNorth:()=>11}));
  getSource = jest.fn(() => this.geoJsonSource);
  addSource = jest.fn();
  addLayer = jest.fn();
  addControl = jest.fn();
  resize = jest.fn();
  removeControl = jest.fn();
  fitBounds = jest.fn();
  remove = jest.fn();
  loadImage = jest.fn().mockResolvedValue({ data: { width: 16, height: 16, data: new Uint8Array(1024) } });
  addImage = jest.fn();
  hasImage = jest.fn().mockReturnValue(false);
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
  it('renders approved external TMS after internal layers and disposes one provider', async () => {
    const map = new FakeMap();
    const registry = new ExternalSourceRegistry(['https://maps.example.org']);
    registry.register({id:'tiles-a',name:'District tiles',mapService:'TMS',
      url:'https://maps.example.org/{z}/{x}/{y}.png',mapLayerPosition:'OVERLAY',
      attribution:'District service'});
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(layer('facility-a',[feature(36,-7)]))
      .setExternalSourceRegistry(registry).addExternalView('{"id":"tiles-a","opacity":0.6}');
    await ready(map,renderer.draw());
    expect(map.addLayer.mock.calls.map(([item])=>item.id)).toEqual(['facility-a','external-tiles-a']);
    expect(map.addSource.mock.calls[1][1]).toMatchObject({scheme:'tms',attribution:'District service'});
    renderer.dispose();
    expect(map.remove).toHaveBeenCalledTimes(1);
  });
  it('requires a declared version for structured basemaps and uses approved raster basemap',async()=>{
    const map = new FakeMap();
    const adapter = provider(map);
    const registry = new ExternalSourceRegistry(['https://maps.example.org']);
    registry.register({id:'base-a',name:'Base',mapService:'XYZ',
      url:'https://maps.example.org/{z}/{x}/{y}.png',mapLayerPosition:'BASEMAP',attribution:'Base source'});
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    expect(()=>renderer.setBaseMap([{id:'base-a'}])).toThrow('2.43');
    renderer.setMapCoreVersion('2.43').setExternalSourceRegistry(registry)
      .setBaseMap([{id:'base-a',opacity:0.4}]);
    await ready(map,renderer.draw());
    expect((adapter.createMap as jest.Mock).mock.calls[0][0].style.layers[0].paint['raster-opacity']).toBe(0.4);
    renderer.dispose();
  });
  it('selects timeline frames without mutating saved selections or loading stale frames', async () => {
    const first = new FakeMap();
    const second = new FakeMap();
    const adapter = provider(first);
    (adapter.createMap as jest.Mock).mockReturnValueOnce(first).mockReturnValueOnce(second);
    const source = {loadGeoFeatures:jest.fn().mockResolvedValue([]),
      loadAnalytics:jest.fn().mockResolvedValue({rows:[]})};
    const thematic = new MapLayer({id:'period-layer',layer:'thematic',
      dataSelections:[{dimension:'ou',items:[{id:'OU1'}]},
        {dimension:'pe',items:[{id:'202501'},{id:'202502'}]}]},source);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.addLayer(thematic).configurePeriods({mode:'TIMELINE',version:'2.43',
      periods:[{id:'202501',startDate:'2025-01-01'},{id:'202502',startDate:'2025-02-01'}],
      layers:[{id:'period-layer',periods:['202501','202502']}]});
    await ready(first,renderer.showPeriod('202501'));
    await ready(second,renderer.showPeriod('202502'));
    expect(source.loadAnalytics.mock.calls.map(([selections])=>
      selections.find((item:{dimension:string})=>item.dimension==='pe').items[0].id))
      .toEqual(['202501','202502']);
    expect(thematic.dataSelections.find(item=>item.dimension==='pe')?.items).toHaveLength(2);
    expect(first.remove).toHaveBeenCalledTimes(1);
    renderer.dispose();
  });
  it('renders tracker and event layers on one provider and disposes once per draw', async () => {
    const first = new FakeMap();
    const second = new FakeMap();
    const adapter = provider(first);
    (adapter.createMap as jest.Mock).mockReturnValueOnce(first).mockReturnValueOnce(second);
    const tracker = new TrackedEntityMapLayer({id:'tracker-a',trackedEntityType:{id:'EntityType1'},
      config:'{"periodType":"lastUpdated"}'},
    {loadTrackedEntities:jest.fn().mockResolvedValue([{orgUnit:'OrgUnit0001',
      geometry:{type:'Point',coordinates:[35,-6]},attributes:[{value:'secret'}]}])})
      .setDataSelections([{dimension:'ou',items:[{id:'OrgUnit0001'}]}]);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.addLayer(tracker).addLayer(layer('facility-a',[feature(36,-7)]));
    await ready(first,renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledTimes(1);
    expect(first.addLayer.mock.calls.map(([item])=>item.id)).toEqual(['tracker-a','facility-a']);
    expect(first.addControl.mock.calls.some(([control,position])=>
      control instanceof LegendControl && position === 'top-left')).toBe(true);
    expect(JSON.stringify(first.addSource.mock.calls[0])).not.toContain('secret');
    await ready(second,renderer.draw());
    expect(first.remove).toHaveBeenCalledTimes(1);
    renderer.dispose();
    expect(second.remove).toHaveBeenCalledTimes(1);
  });
  it('combines layer legends into one top-left control', async () => {
    const map = new FakeMap();
    const first = layer('first', [feature(35, -6)]);
    const second = layer('second', [feature(36, -7)]);
    first.legendSet = { id: 'first-legend', name: 'First legend', legends: [
      { id: 'a', name: 'A', color: '#123456', startValue: 0, endValue: 10 }] };
    second.legendSet = { id: 'second-legend', name: 'Second legend', legends: [
      { id: 'b', name: 'B', color: '#abcdef', startValue: 10, endValue: 20 }] };
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(first).addLayer(second);
    await ready(map, renderer.draw());
    const legendCalls = map.addControl.mock.calls.filter(([control]) => control instanceof LegendControl);
    expect(legendCalls).toHaveLength(1);
    expect(legendCalls[0][1]).toBe('top-left');
    const element = (legendCalls[0][0] as LegendControl).onAdd(map);
    expect(element.textContent).toContain('First legend');
    expect(element.textContent).toContain('Second legend');
    expect((element.querySelector('[role="group"]') as HTMLElement).hidden).toBe(true);
  });
  it('refreshes server clusters at zoom scale and drops stale results after disposal', async () => {
    const map = new FakeMap();
    const calls: number[] = [];
    const source = {loadGeoFeatures:jest.fn(),loadAnalytics:jest.fn(),loadEvents:jest.fn(),
      loadEventClusters:jest.fn().mockImplementation(async (_selection,_base,_signal,viewport) => {
        calls.push(viewport?.clusterSize ?? 70000);
        return {headers:[{name:'count'},{name:'center'}],rows:[
          [String(viewport?.clusterSize ?? 3),'{"type":"Point","coordinates":[-12,8]}']]};
      })};
    const event = new MapLayer({id:'zoom-events',layer:'event',eventClustering:true,
      eventPointColor:'333333',eventSelection:{locationAccess:'precise',program:'VBqh0ynB2wv',
        startDate:'2025-08-04',endDate:'2026-08-04',coordinateField:'EVENT',
        organisationUnits:['ImspTQPwCqd']}},source);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.setZoom(8).addLayer(event);
    await ready(map,renderer.draw());
    expect(map.on).toHaveBeenCalledWith('moveend',expect.any(Function));
    map.currentZoom = 9;
    map.moveListener?.();
    await Promise.resolve(); await Promise.resolve();
    expect(calls).toContain(35000);
    expect(map.geoJsonSource.setData).toHaveBeenCalledWith(expect.objectContaining({features:[
      expect.objectContaining({properties:expect.objectContaining({point_count:35000})})]}));
    let finishStale: ((value: unknown) => void) | undefined;
    source.loadEventClusters.mockImplementationOnce(() => new Promise(resolve => { finishStale = resolve; }));
    map.currentZoom = 10;
    map.moveListener?.();
    const updatesBeforeDispose = map.geoJsonSource.setData.mock.calls.length;
    renderer.dispose();
    finishStale?.({headers:[{name:'count'},{name:'center'}],rows:[
      ['999','{"type":"Point","coordinates":[-12,8]}']]});
    await Promise.resolve(); await Promise.resolve();
    expect(map.geoJsonSource.setData).toHaveBeenCalledTimes(updatesBeforeDispose);
    expect(map.off).toHaveBeenCalledWith('moveend',expect.any(Function));
  });
  it('keeps historical non-event map fitBounds and local style with saved basemap metadata', async () => {
    const map = new FakeMap();
    const adapter = provider(map);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.setBaseMap('osmLight').addLayer(layer('thematic',[feature(35,-6)]));
    await ready(map,renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledWith(expect.objectContaining({
      zoom:5,style:'https://tiles.openfreemap.org/styles/positron'}));
    expect(map.fitBounds).toHaveBeenCalled();
    expect(map.on).not.toHaveBeenCalled();
  });
  it.each([
    ['osmDark','https://tiles.openfreemap.org/styles/dark'],
    ['osmFiord','https://tiles.openfreemap.org/styles/fiord'],
  ])('uses the built-in %s style without changing overlay order',async(id,expectedStyle)=>{
    const map = new FakeMap();
    const adapter = provider(map);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.setBaseMap(id).addLayer(layer('event-a',[feature(-13,8)]));
    await ready(map,renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledWith(expect.objectContaining({style:expectedStyle}));
    expect(map.addLayer.mock.calls.map(([item])=>item.id)).toEqual(['event-a']);
  });
  it('uses OSM Detailed raster tiles and treats an id-less 2.43 entry as OSM Light',async()=>{
    const detailedMap = new FakeMap();
    const detailed = provider(detailedMap);
    const first = new D2Maps(detailed).setId('detailed') as D2Maps;
    first.setBaseMap('openStreetMap');
    await ready(detailedMap,first.draw());
    expect((detailed.createMap as jest.Mock).mock.calls[0][0].style).toMatchObject({
      version:8,sources:{basemap:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}},
      layers:[{id:'basemap',type:'raster'}]});
    const defaultMap = new FakeMap();
    const fallback = provider(defaultMap);
    const second = new D2Maps(fallback).setId('default') as D2Maps;
    second.setMapCoreVersion('2.43').setBaseMap([{opacity:1,hidden:false}]);
    await ready(defaultMap,second.draw());
    expect((fallback.createMap as jest.Mock).mock.calls[0][0].style)
      .toBe('https://tiles.openfreemap.org/styles/positron');
  });
  it('adapts a saved 2.43 event view with top-level dates and default EVENT coordinates', async () => {
    const map = new FakeMap();
    const source = {loadGeoFeatures:jest.fn(),loadAnalytics:jest.fn(),loadEvents:jest.fn(),
      loadEventClusters:jest.fn().mockResolvedValue({headers:[{name:'count'},{name:'center'}],
        rows:[['2914','{"type":"Point","coordinates":[-13.1,8.8]}']]})};
    const event = new MapLayer({id:'saved-event',layer:'event',
      program:{id:'VBqh0ynB2wv'} as never,programStage:{id:'pTo4uMt3xur'},
      startDate:'2025-08-04T02:00:00.000',endDate:'2026-08-04T02:00:00.000',
      eventClustering:true,config:undefined},source).setDataSelections([
        {dimension:'ou',items:[{id:'ImspTQPwCqd'}]}]);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(event);
    await ready(map,renderer.draw());
    expect(source.loadEventClusters).toHaveBeenCalledWith(expect.objectContaining({
      program:'VBqh0ynB2wv',stage:'pTo4uMt3xur',coordinateField:'EVENT',
      organisationUnits:['ImspTQPwCqd'],startDate:'2025-08-04'}),
      '../../..',expect.any(AbortSignal));
    expect(map.addSource.mock.calls[0][1].cluster).toBeUndefined();
    expect(map.addLayer.mock.calls.map(([item])=>item.id)).toEqual([
      'saved-event-clusters','saved-event-counts']);
    expect(map.fitBounds).toHaveBeenCalled();
  });
  it('renders a saved unclustered event view as individual points without cluster requests or layers', async () => {
    const map = new FakeMap();
    const source = {loadGeoFeatures:jest.fn(),loadAnalytics:jest.fn(),
      loadEvents:jest.fn().mockResolvedValue({
        headers:[{name:'event'},{name:'coordinates'},{name:'ou'}],
        rows:[['private-event','[-13.1,8.8]','ImspTQPwCqd']]}),
      loadEventClusters:jest.fn()};
    const event = new MapLayer({id:'saved-points',layer:'event',
      program:{id:'VBqh0ynB2wv'} as never,
      startDate:'2025-08-04T02:00:00.000',endDate:'2026-08-04T02:00:00.000',
      eventClustering:false,eventPointColor:'225588',eventPointRadius:8},source)
      .setDataSelections([{dimension:'ou',items:[{id:'ImspTQPwCqd'}]}]);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(event);
    await ready(map,renderer.draw());
    expect(source.loadEvents).toHaveBeenCalledWith(expect.objectContaining({
      program:'VBqh0ynB2wv',organisationUnits:['ImspTQPwCqd']}),
      '../../..',expect.any(AbortSignal));
    expect(source.loadEventClusters).not.toHaveBeenCalled();
    expect(map.addSource.mock.calls[0][1]).toMatchObject({type:'geojson',
      data:{features:[{geometry:{type:'Point',coordinates:[-13.1,8.8]},properties:{}}]}});
    expect(map.addSource.mock.calls[0][1].cluster).toBeUndefined();
    expect(map.addLayer.mock.calls.map(([item])=>item.id)).toEqual(['saved-points']);
    expect(map.addLayer.mock.calls[0][0].paint).toMatchObject({
      'circle-color':'#225588','circle-radius':8});
    renderer.dispose();
    expect(map.remove).toHaveBeenCalledTimes(1);
  });
  it('renders authorized event points and provider clusters without leaking event identifiers', async () => {
    const map = new FakeMap();
    const eventSource = { loadGeoFeatures: jest.fn(), loadAnalytics: jest.fn(),
      loadEvents: jest.fn().mockResolvedValue({headers:[{name:'psi'}, {name:'coordinates'}, {name:'ou'}],
        rows:[['private-id','[35,-6]','OrgUnit0001']]}) };
    const event = new MapLayer({id:'events', layer:'event', eventClustering:true,
      eventCategoryColors:{A:'#225588'},
      eventSelection:{locationAccess:'precise', program:'Program0001', startDate:'2024-01-01', endDate:'2024-12-31',
        coordinateField:'psigeometry', organisationUnits:['OrgUnit0001']}}, eventSource);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(event);
    await ready(map, renderer.draw());
    expect(eventSource.loadGeoFeatures).not.toHaveBeenCalled();
    expect(eventSource.loadAnalytics).not.toHaveBeenCalled();
    expect(map.addSource).toHaveBeenCalledWith('events-source', expect.objectContaining({
      cluster:true, clusterRadius:50, data:expect.objectContaining({features:[expect.objectContaining({
        properties:{} })]})}));
    expect(map.addLayer.mock.calls.map(([item]) => item.id)).toEqual(['events-clusters','events-counts','events']);
    expect(map.addLayer.mock.calls[0][0].paint).toEqual(expect.objectContaining({
      'circle-pitch-alignment':'viewport', 'circle-pitch-scale':'viewport' }));
    expect(map.addLayer.mock.calls[1][0].layout['text-field']).toEqual(['get','point_count_abbreviated']);
    expect(map.addLayer.mock.calls[2][0].paint['circle-color'])
      .toEqual(['match', ['get','category'], 'A', '#225588', '#333333']);
    expect(map.fitBounds).toHaveBeenCalled();
    renderer.dispose();
    expect(map.remove).toHaveBeenCalledTimes(1);
  });
  it('resizes the provider canvas when the host card changes size and stops on disposal', async () => {
    const host = document.createElement('div');
    host.id = 'host';
    document.body.appendChild(host);
    const previous = globalThis.ResizeObserver;
    let callback: ResizeObserverCallback | undefined;
    const disconnect = jest.fn();
    globalThis.ResizeObserver = class {
      constructor(listener: ResizeObserverCallback) { callback = listener; }
      observe = jest.fn();
      disconnect = disconnect;
      unobserve = jest.fn();
    } as typeof ResizeObserver;
    try {
      const map = new FakeMap();
      const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
      await ready(map, renderer.draw());
      callback?.([], {} as ResizeObserver);
      expect(map.resize).toHaveBeenCalledTimes(1);
      renderer.dispose();
      expect(disconnect).toHaveBeenCalledTimes(1);
      callback?.([], {} as ResizeObserver);
      expect(map.resize).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.ResizeObserver = previous;
      host.remove();
    }
  });
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
  it('uses group-set GeoFeature dimensions without an analytics or OU-membership request', async () => {
    const source = { loadGeoFeatures: jest.fn().mockResolvedValue([
      { id: 'ou-a', na: 'Clinic A', co: '[35,-6]', ty: 1,
        dimensions: { GroupSet001: 'Group000001' } } as MapGeoFeature,
    ]), loadAnalytics: jest.fn(), loadFacilityGroups: jest.fn().mockResolvedValue([
      { id: 'Group000001', name: 'Hospital', color: '#225588', symbol: 'hospital.png',
        organisationUnitIds: [] },
    ]) };
    const facility = new MapLayer({ id: 'grouped', layer: 'facility',
      organisationUnitGroupSet: { id: 'GroupSet001' } }, source);
    await facility.loadFeatures();
    expect(source.loadFacilityGroups).toHaveBeenCalledWith('GroupSet001', '../../..', undefined);
    expect(source.loadGeoFeatures).toHaveBeenCalledWith([], '../../..', undefined,
      { includeGroupSets: true });
    expect(source.loadAnalytics).not.toHaveBeenCalled();
    expect(facility.features[0].properties).toMatchObject({ groupId: 'Group000001', color: '#225588' });
    expect(facility.legendSet.legends[0].name).toBe('Hospital');
  });
  it('registers a safe group symbol and renders it instead of a circle', async () => {
    const map = new FakeMap();
    const source = { loadGeoFeatures: jest.fn().mockResolvedValue([
      { id: 'ou-a', na: 'Clinic A', co: '[35,-6]', ty: 1 } as MapGeoFeature,
    ]), loadAnalytics: jest.fn(), loadFacilityGroups: jest.fn().mockResolvedValue([
      { id: 'Group000001', name: 'Hospital', color: '#225588', symbol: 'hospital.png',
        organisationUnitIds: ['ou-a'] },
    ]) };
    const facility = new MapLayer({ id: 'grouped', layer: 'facility',
      organisationUnitGroupSet: { id: 'GroupSet001' } }, source);
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(facility);
    await ready(map, renderer.draw());
    expect(map.loadImage).toHaveBeenCalledWith('http://localhost/images/orgunitgroup/hospital.png');
    expect(map.addImage).toHaveBeenCalledWith('grouped-group-Group000001', expect.any(Object));
    expect(map.addLayer.mock.calls.find(([value]) => value.id === 'grouped-icons')?.[0])
      .toMatchObject({ type: 'symbol', layout: { 'icon-allow-overlap': true } });
    expect(map.addLayer.mock.calls.find(([value]) => value.id === 'grouped')?.[0].filter)
      .toContainEqual(['!', ['in', ['get', 'groupId'], ['literal', ['Group000001']]]]);
  });
  it('falls back to a coloured circle when a group symbol cannot load', async () => {
    const map = new FakeMap();
    map.loadImage.mockRejectedValue(new Error('missing image'));
    const source = { loadGeoFeatures: jest.fn().mockResolvedValue([
      { id: 'ou-a', na: 'Clinic A', co: '[35,-6]', ty: 1 } as MapGeoFeature,
    ]), loadAnalytics: jest.fn(), loadFacilityGroups: jest.fn().mockResolvedValue([
      { id: 'Group000001', name: 'Hospital', color: '#225588', symbol: '/api/icons/missing.png',
        organisationUnitIds: ['ou-a'] },
    ]) };
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(new MapLayer({ id: 'grouped', layer: 'facility',
      organisationUnitGroupSet: { id: 'GroupSet001' } }, source));
    await ready(map, renderer.draw());
    expect(map.addLayer.mock.calls.map(([value]) => value.id)).not.toContain('grouped-icons');
    expect(map.addLayer.mock.calls.find(([value]) => value.id === 'grouped')?.[0].type).toBe('circle');
  });
  it('does not register a late facility symbol after disposal', async () => {
    const map = new FakeMap();
    let finishImage!: (value: { data: unknown }) => void;
    map.loadImage.mockImplementation(() => new Promise(resolve => { finishImage = resolve; }));
    const source = { loadGeoFeatures: jest.fn().mockResolvedValue([
      { id: 'ou-a', na: 'Clinic A', co: '[35,-6]', ty: 1,
        dimensions: { GroupSet001: 'Group000001' } } as MapGeoFeature,
    ]), loadAnalytics: jest.fn(), loadFacilityGroups: jest.fn().mockResolvedValue([
      { id: 'Group000001', name: 'Hospital', symbol: 'hospital.png',
        organisationUnitIds: [] },
    ]) };
    const renderer = new D2Maps(provider(map)).setId('host') as D2Maps;
    renderer.addLayer(new MapLayer({ id: 'grouped', layer: 'facility',
      organisationUnitGroupSet: { id: 'GroupSet001' } }, source));
    const drawing = renderer.draw();
    while (!map.listener) await Promise.resolve();
    map.listener?.();
    while (!finishImage) await Promise.resolve();
    renderer.dispose();
    finishImage({ data: {} });
    await drawing;
    expect(map.addImage).not.toHaveBeenCalled();
    expect(map.addSource).not.toHaveBeenCalled();
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

  it('renders overlays above default OSM Light when no provider style is supplied', async () => {
    const map = new FakeMap();
    const adapter = provider(map);
    const renderer = new D2Maps(adapter).setId('host') as D2Maps;
    renderer.addLayer(layer('overlay', [feature(35, -6)]));
    await ready(map, renderer.draw());
    expect(adapter.createMap).toHaveBeenCalledWith(expect.objectContaining({
      style: 'https://tiles.openfreemap.org/styles/positron',
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
