import { clusterFeatures, clusterSizeForZoom, eventFeatures, eventRequest, FetchEventDataSource } from './event-layer';
import { eventQueryFixture } from '../../testing/fixtures/map-characterization.fixtures';

const selection = { locationAccess:'precise' as const, program: 'Program0001', startDate: '2024-01-01', endDate: '2024-12-31',
  organisationUnits: ['OrgUnit0001'], coordinateField: 'psigeometry' as const };

describe('event layer contract', () => {
  it('halves cluster distance when zooming in and doubles it when zooming out', () => {
    expect([7,8,9].map(clusterSizeForZoom)).toEqual([140000,70000,35000]);
  });
  it('builds an explicit bounded query without OU coordinate fallback', () => {
    const url = eventRequest(selection, 1);
    expect(url).toContain('coordinateField=psigeometry');
    expect(url).toContain('coordinateOuFallback=false');
    expect(url).toContain('pageSize=100');
    expect(url).toContain('dimension=ou%3AOrgUnit0001');
  });
  it('projects only valid authorized coordinates and strips identifiers', () => {
    const rows = { headers: [{name:'psi'}, {name:'coordinates'}, {name:'ou'}, {name:'StyleItem01'}],
      rows: [['secret','[35,-6]','OrgUnit0001','A'], ['secret2',null,'OrgUnit0001','A'],
        ['secret3','[200,2]','OrgUnit0001','B']] };
    expect(eventFeatures(rows, {allowedOrganisationUnits:['OrgUnit0001'], styleItem:'StyleItem01'}).features)
      .toEqual([{type:'Feature', geometry:{type:'Point',coordinates:[35,-6]},
        properties:{category:'A'}}]);
  });
  it('rejects malformed or unverified settings', () => {
    expect(() => eventRequest({...selection, coordinateField:'fallback' as never}, 1)).toThrow();
    expect(() => eventRequest({...selection, coordinateOuFallback:true} as never, 1)).toThrow();
    expect(() => eventRequest({...selection, locationAccess:undefined} as never, 1)).toThrow('approved');
  });
  it('bounds paging and cancels fetches', async () => {
    const fetcher = jest.fn().mockResolvedValue({ok:true,json:async()=>({headers:[{name:'coordinates'}],rows:[]})});
    const source = new FetchEventDataSource(fetcher as never);
    await source.load(selection, '/dhis', new AbortController().signal);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('keeps only explicitly authorized locations and verified style categories', () => {
    expect(eventFeatures(eventQueryFixture(), {
      allowedOrganisationUnits:['OrgUnit0001'], styleItem:'StyleItem01',
    }).features.map(feature => feature.properties)).toEqual([{category:'A'}, {category:'B'}]);
  });
  it('accepts target 2.43 GeoJSON geometry and server-authorized descendants', () => {
    const response = {headers:[{name:'geometry'},{name:'ou'}], rows:[
      ['{"type":"Point","coordinates":[-12.2,8.9]}','ChildUnit01'],
      ['{"type":"Point","coordinates":[-12.2,98.9]}','ChildUnit02']]};
    expect(eventFeatures(response, {allowedOrganisationUnits:['RootUnit001'],
      serverAuthorizedDescendants:true}).features).toEqual([{type:'Feature',
      geometry:{type:'Point',coordinates:[-12.2,8.9]},properties:{}}]);
  });
  it('projects target cluster counts and GeoJSON centers without event identifiers', () => {
    expect(clusterFeatures({headers:[{name:'count'},{name:'center'}],rows:[
      ['2914','{"type":"Point","coordinates":[-13.1,8.8]}']]}).features[0])
      .toEqual({type:'Feature',geometry:{type:'Point',coordinates:[-13.1,8.8]},
        properties:{point_count:2914,point_count_abbreviated:'2.9k'}});
  });
  it('formats large cluster counts in the compact style shown by the reference', () => {
    const rows = {headers:[{name:'count'},{name:'center'}],rows:[
      ['13770','{"type":"Point","coordinates":[-13,8]}'],
      ['1300','{"type":"Point","coordinates":[-12,8]}']]};
    expect(clusterFeatures(rows).features.map(item => item.properties?.['point_count_abbreviated']))
      .toEqual(['13k','1.3k']);
  });
  it('requests verified server counts without event identifiers or guessed composition', async () => {
    const fetcher = jest.fn().mockResolvedValue({ok:true,json:async()=>({
      headers:[{name:'count'},{name:'center'}],rows:[]})});
    await new FetchEventDataSource(fetcher as never).loadClusters({...selection,
      stage:'pTo4uMt3xur'},'/dhis',undefined,{clusterSize:70000,bbox:[-14,6,-10,11]});
    const url = String(fetcher.mock.calls[0][0]);
    expect(url).toContain('/api/analytics/events/cluster/Program0001?');
    expect(url).toContain('clusterSize=70000');
    expect(url).toContain('bbox=-14%2C6%2C-10%2C11');
    expect(url).toContain('includeClusterPoints=false');
    expect(url).toContain('stage=pTo4uMt3xur');
    await expect(new FetchEventDataSource(fetcher as never).loadClusters({
      ...selection,styleItem:'StyleItem01'},'/dhis')).rejects.toThrow('verified category payload');
  });
  it('rejects stale requests before a page is fetched', async () => {
    const fetcher = jest.fn();
    const abort = new AbortController(); abort.abort();
    await expect(new FetchEventDataSource(fetcher as never).load(selection, '/dhis', abort.signal))
      .rejects.toMatchObject({name:'AbortError'});
    expect(fetcher).not.toHaveBeenCalled();
  });
});
