import { ExternalSourceRegistry } from './external-sources';

const origin = 'https://maps.example.org';
const source = (mapService: string, url: string) => ({id:'source-1',name:'District source',mapService,url,
  mapLayerPosition:'OVERLAY',attribution:'District service'});

describe('external source registry',()=>{
  it('keeps saved views tied to registered sources and refuses URL overrides',()=>{
    const registry = new ExternalSourceRegistry([origin]);
    registry.register(source('XYZ',`${origin}/tiles/{z}/{x}/{y}.png`));
    expect(registry.parseView('{"id":"source-1","opacity":0.5}')).toMatchObject({sourceId:'source-1',opacity:0.5});
    expect(()=>registry.parseView('{"id":"source-1","url":"https://evil.example/a"}')).toThrow('override');
    expect(()=>registry.parseView('{"id":"unknown"}')).toThrow('Unregistered');
  });
  it('blocks unapproved URLs and embedded credentials or unsupported services',()=>{
    const registry = new ExternalSourceRegistry([origin]);
    expect(()=>registry.register(source('XYZ','http://127.0.0.1/{z}/{x}/{y}'))).toThrow('approved');
    expect(()=>registry.register(source('XYZ',`${origin}/tiles/{z}/{x}/{y}?token=secret`))).toThrow('credentials');
    expect(()=>registry.register(source('ARCGIS_FEATURE',`${origin}/features`))).toThrow('ArcGIS');
    expect(()=>registry.register(source('XYZ',`${origin}/tiles/{z}/{x}`))).toThrow('{y}');
  });
  it('adapts WMS and TMS as raster sources',()=>{
    const wms = new ExternalSourceRegistry([origin]);
    const record = wms.register({...source('WMS',`${origin}/wms`),layers:'risk:flood',imageFormat:'PNG'});
    const url = (wms.rasterSource(record).tiles as string[])[0];
    expect(url).toContain('bbox={bbox-epsg-3857}');
    expect(url).toContain('layers=risk%3Aflood');
    const tms = new ExternalSourceRegistry([origin]);
    expect(tms.rasterSource(tms.register(source('TMS',`${origin}/tiles/{z}/{x}/{y}`))).scheme).toBe('tms');
  });
  it('loads bounded GeoJSON without credentials and reports HTTP errors',async()=>{
    const registry = new ExternalSourceRegistry([origin]);
    const record = registry.register(source('GEOJSON_URL',`${origin}/districts.geojson`));
    const fetcher = jest.fn().mockResolvedValue({ok:true,headers:{get:()=>null},
      text:async()=>'{"type":"FeatureCollection","features":[]}'});
    expect((await registry.loadGeoJSON(record,fetcher)).features).toEqual([]);
    expect(fetcher.mock.calls[0][1]).toMatchObject({credentials:'omit',mode:'cors'});
    await expect(registry.loadGeoJSON(record,jest.fn().mockResolvedValue({ok:false,status:403})))
      .rejects.toThrow('403');
  });
});
