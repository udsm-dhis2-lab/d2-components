import { VisualizationType } from '../shared/models';
import { createDefaultRendererRegistry } from './renderer-registry';
import { ExternalSourceRegistry } from '@iapps/d2-maps';

describe('renderer registry', () => {
  it('requires approved registered sources for external saved map views',()=>{
    const sourceRegistry = new ExternalSourceRegistry(['https://maps.example.org']);
    sourceRegistry.register({id:'tiles-a',name:'Tiles',mapService:'XYZ',
      url:'https://maps.example.org/{z}/{x}/{y}.png',mapLayerPosition:'OVERLAY',attribution:'Source'});
    const context = {id:'host',configuredType:'MAP' as const,baseUrl:'/dhis',
      config:{config:{basemap:'osmLight',mapViews:[{id:'external-a',layer:'external',
        config:'{"id":"tiles-a"}'}]}},dataSelections:[],mapLayerConfig:undefined,
      mapExternalSourceRegistry:sourceRegistry,tableDashboardItem:undefined,
      legendSets:undefined,plotOptions:undefined};
    expect(createDefaultRendererRegistry().create('MAP',context,undefined)).toBeDefined();
    expect(()=>createDefaultRendererRegistry().create('MAP',
      {...context,mapExternalSourceRegistry:undefined},undefined)).toThrow('registry');
  });
  it('keeps saved event view dates, stage and OU selections through MAP facade delegation', async () => {
    const loadEventClusters = jest.fn().mockResolvedValue({headers:[{name:'count'},{name:'center'}],
      rows:[['3','{"type":"Point","coordinates":[-12,8]}']]});
    const renderer = createDefaultRendererRegistry().create('MAP', {
      id:'map-host',configuredType:'MAP',baseUrl:'/dhis',
      config:{config:{zoom:8,longitude:-11.84,latitude:8.43,basemap:'osmLight',
        mapViews:[{id:'event-a',layer:'event',program:{id:'VBqh0ynB2wv'},
        programStage:{id:'pTo4uMt3xur'},startDate:'2025-08-04T02:00:00.000',
        endDate:'2026-08-04T02:00:00.000',eventClustering:true,eventCoordinateField:null,
        rows:[{dimension:'ou',items:[{id:'ImspTQPwCqd'}]}],columns:[],filters:[]}]}},
      dataSelections:[],mapLayerConfig:undefined,mapDataSource:{loadEventClusters,
        loadEvents:jest.fn(),loadGeoFeatures:jest.fn(),loadAnalytics:jest.fn()},
      tableDashboardItem:undefined,legendSets:undefined,plotOptions:undefined,program:undefined,
    },undefined) as unknown as {zoom:number;loadLayers:()=>Promise<unknown[]>;layers:{features:unknown[]}[]};
    await renderer.loadLayers();
    expect(renderer.zoom).toBe(5);
    expect(loadEventClusters).toHaveBeenCalledWith(expect.objectContaining({
      program:'VBqh0ynB2wv',stage:'pTo4uMt3xur',coordinateField:'EVENT',
      organisationUnits:['ImspTQPwCqd']}),'/dhis',expect.any(AbortSignal));
    expect(renderer.layers[0].features).toHaveLength(1);
  });
  it('centrally identifies every supported and legacy-unsupported type', () => {
    const registry = createDefaultRendererRegistry();
    const supported: VisualizationType[] = [
      'CHART',
      'LINE',
      'COLUMN',
      'BAR',
      'DOTTED',
      'PIE',
      'STACKED_BAR',
      'STACKED_COLUMN',
      'AREA',
      'RADAR',
      'SOLIDGAUGE',
      'MAP',
      'REPORT_TABLE',
      'PIVOT_TABLE',
      'SINGLE_VALUE',
      'YEAR_OVER_YEAR_LINE',
      'CUSTOM',
      'TRACKED_ENTITY_LAYER',
    ];

    supported.forEach((type) => expect(registry.supports(type)).toBe(true));
    expect(registry.supports('DICTIONARY')).toBe(false);
    expect(registry.supports('MAPBOX')).toBe(false);
  });
});
