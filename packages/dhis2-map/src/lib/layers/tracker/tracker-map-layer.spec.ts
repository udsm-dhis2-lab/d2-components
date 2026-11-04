import { TrackedEntityMapLayer, parseTrackerConfig,
  trackerFeatures, trackerRequest, trackerSelection } from './tracker-map-layer';
import { FetchTrackerDataSource } from './tracker-data-source';

const ou = 'OrgUnit0001';
const view = {id:'tracker-a',layer:'trackedEntity',trackedEntityType:{id:'EntityType1'},
  program:{id:'Program0001'},programStatus:'ACTIVE',followUp:false,
  organisationUnitSelectionMode:'SELECTED',startDate:'2025-01-01',endDate:'2025-12-31',
  config:'{"periodType":"program","relationships":null}'};
const selections = [{dimension:'ou',items:[{id:ou}]}];
const entity = {trackedEntity:'private-id',trackedEntityType:'EntityType1',orgUnit:ou,
  attributes:[{attribute:'private',value:'<img src=x onerror=alert(1)>'}],
  geometry:{type:'Point',coordinates:[35,-6]}};

describe('tracked-entity layer contract',()=>{
  it('validates encoded config, period and relationship shape without enabling lines',()=>{
    expect(parseTrackerConfig(view.config)).toEqual({periodType:'program',relationships:null});
    expect(()=>parseTrackerConfig('{bad')).toThrow('JSON');
    expect(()=>parseTrackerConfig('{"periodType":"arbitrary"}')).toThrow('periodType');
    expect(()=>parseTrackerConfig('{"relationships":{"type":"bad"}}')).toThrow('relationship');
    expect(parseTrackerConfig('{"relationships":{"type":"Relation001"}}').relationships).toMatchObject({type:'Relation001'});
  });
  it('builds a bounded, access-scoped query with status, follow-up and program dates',()=>{
    const selection = trackerSelection(view,selections);
    const request = trackerRequest(selection);
    expect(request).toContain('orgUnits=OrgUnit0001');
    expect(request).toContain('orgUnitMode=SELECTED');
    expect(request).toContain('enrollmentStatus=ACTIVE');
    expect(request).toContain('followUp=false');
    expect(request).toContain('enrollmentEnrolledAfter=2025-01-01');
    expect(request).not.toContain('relationships');
    expect(()=>trackerSelection(view,[])).toThrow('organisation unit');
    expect(()=>trackerSelection({...view,organisationUnitSelectionMode:'ALL'},selections)).toThrow('mode');
  });
  it('projects authorized geometry without identifiers, attributes or popup markup',()=>{
    const selection = trackerSelection(view,selections);
    const features = trackerFeatures([entity,{...entity,orgUnit:'OtherOu001',geometry:{type:'Point',coordinates:[36,-7]}}],selection);
    expect(features).toHaveLength(1);
    expect(features[0].properties).toEqual({color:'#333333'});
    expect(JSON.stringify(features)).not.toContain('private');
    expect(JSON.stringify(features)).not.toContain('<img');
  });
  it('does not cache responses and honors abort signals',async()=>{
    const fetcher = jest.fn().mockResolvedValue({ok:true,json:async()=>({trackedEntities:[entity]})});
    const source = new FetchTrackerDataSource(fetcher as unknown as typeof fetch);
    const signal = new AbortController().signal;
    await source.loadTrackedEntities(trackerSelection(view,selections),'/dhis',signal);
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining('/api/tracker/trackedEntities?'),
      {signal,cache:'no-store'});
  });
  it('loads bounded pages without silently truncating an authorized result',async()=>{
    const fetcher = jest.fn()
      .mockResolvedValueOnce({ok:true,json:async()=>({trackedEntities:[entity],pager:{pageCount:2}})})
      .mockResolvedValueOnce({ok:true,json:async()=>({trackedEntities:[entity],pager:{pageCount:2}})});
    const records = await new FetchTrackerDataSource(fetcher as unknown as typeof fetch)
      .loadTrackedEntities(trackerSelection(view,selections),'/dhis');
    expect(records).toHaveLength(2);
    expect(fetcher.mock.calls[1][0]).toContain('page=2');
  });
  it('loads only tracker data, then keeps provider features redacted',async()=>{
    const source = {loadTrackedEntities:jest.fn().mockResolvedValue([entity])};
    const layer = new TrackedEntityMapLayer(view,source).setDataSelections(selections);
    await layer.loadFeatures();
    expect(source.loadTrackedEntities).toHaveBeenCalledTimes(1);
    expect(layer.featureCollection.features).toHaveLength(1);
    expect(layer.featureCollection.features[0].properties).toEqual({color:'#333333'});
  });
  it('suppresses exact points and skips acquisition when location access is denied',async()=>{
    const source = {loadTrackedEntities:jest.fn()};
    const layer = new TrackedEntityMapLayer({...view,locationAccess:'none'},source).setDataSelections(selections);
    await layer.loadFeatures();
    expect(source.loadTrackedEntities).not.toHaveBeenCalled();
    expect(layer.featureCollection.features).toEqual([]);
  });
  it('rejects unverified descendant scope for supplied tracker records',async()=>{
    const layer = new TrackedEntityMapLayer({...view,organisationUnitSelectionMode:'DESCENDANTS'},
      undefined,[entity]).setDataSelections(selections);
    await expect(layer.loadFeatures()).rejects.toThrow('SELECTED');
  });
  it('does not publish features from an aborted tracker load',async()=>{
    let resolveLoad: ((value: readonly unknown[])=>void) | undefined;
    const source = {loadTrackedEntities:jest.fn().mockReturnValue(new Promise<readonly unknown[]>(resolve=>{
      resolveLoad=resolve;
    }))};
    const layer = new TrackedEntityMapLayer(view,source).setDataSelections(selections);
    const abort = new AbortController();
    const loading = layer.loadFeatures(abort.signal);
    abort.abort();
    resolveLoad?.([entity]);
    await loading;
    expect(layer.features).toBeUndefined();
  });
});
