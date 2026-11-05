import type { FeatureCollection } from 'geojson';

export type ExternalMapService = 'WMS' | 'XYZ' | 'TMS' | 'VECTOR_STYLE' | 'GEOJSON_URL';
export interface ExternalSourceRecord {
  readonly id: string;
  readonly name: string;
  readonly mapService: ExternalMapService;
  readonly url: string;
  readonly mapLayerPosition: 'BASEMAP' | 'OVERLAY';
  readonly attribution: string;
  readonly layers?: string;
  readonly imageFormat?: 'PNG' | 'JPG';
}
export interface ExternalView {
  readonly id: string;
  readonly sourceId: string;
  readonly sortOrder?: number;
  readonly opacity?: number;
  readonly hidden?: boolean;
  readonly color?: string;
}

/** Exact origins are configured by the host app, not inferred from a saved map. */
export class ExternalSourceRegistry {
  readonly #records = new Map<string, ExternalSourceRecord>();
  readonly #origins: ReadonlySet<string>;
  constructor(origins: readonly string[]) {
    this.#origins = new Set(origins.map(origin => {
      const url = new URL(origin);
      if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search)
        throw new Error('External source origins must be exact HTTPS origins');
      if (url.hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) ||
        url.hostname.endsWith('.local') || url.hostname.endsWith('.internal'))
        throw new Error('Local or IP external source origins are not approved');
      return url.origin;
    }));
  }
  validateUrl(input: string, templates = false): string {
    let url: URL;
    try { url = new URL(input); } catch { throw new Error('External source URL is invalid'); }
    if (url.protocol !== 'https:' || !this.#origins.has(url.origin) || url.username || url.password || url.hash)
      throw new Error('External source URL is not approved');
    if ([...url.searchParams.keys()].some(key => /^(token|key|api[_-]?key|auth|password|secret)$/i.test(key)))
      throw new Error('External source URL must not embed credentials');
    if (!templates && /\{[^}]+\}/.test(input)) throw new Error('Unexpected URL template');
    return input;
  }
  register(input: unknown): ExternalSourceRecord {
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw new Error('External source registry entry must be an object');
    const data = input as Record<string, unknown>;
    const service = data['mapService'];
    if (service === 'ARCGIS_FEATURE') throw new Error('ArcGIS Feature sources are unsupported');
    if (typeof service !== 'string' || !['WMS','XYZ','TMS','VECTOR_STYLE','GEOJSON_URL'].includes(service))
      throw new Error(`Unsupported external map service: ${String(service)}`);
    if (typeof data['id'] !== 'string' || !data['id'] || typeof data['name'] !== 'string' || !data['name'])
      throw new Error('External source id and name are required');
    if (typeof data['url'] !== 'string') throw new Error('External source URL is required');
    if (typeof data['attribution'] !== 'string' || !data['attribution'].trim())
      throw new Error('External source attribution is required');
    if (/[<>]/.test(data['attribution']) || data['attribution'].length > 500)
      throw new Error('External source attribution must be plain text');
    const position = data['mapLayerPosition'];
    if (position !== 'BASEMAP' && position !== 'OVERLAY')
      throw new Error('External source position must be BASEMAP or OVERLAY');
    const template = service === 'XYZ' || service === 'TMS';
    this.validateUrl(data['url'],template);
    if (template && !['{z}','{x}','{y}'].every(part => (data['url'] as string).includes(part)))
      throw new Error('Tile source requires {z}, {x}, and {y}');
    if (service === 'WMS' &&
      (typeof data['layers'] !== 'string' || !/^[\w:.,-]+$/.test(data['layers']) ||
        !['PNG','JPG'].includes(String(data['imageFormat']))))
      throw new Error('WMS source requires layers and PNG or JPG imageFormat');
    const record: ExternalSourceRecord = {id:data['id'],name:data['name'],url:data['url'],
      mapService:service as ExternalMapService,mapLayerPosition:position,
      attribution:data['attribution'],
      ...(service === 'WMS' ? {layers:data['layers'] as string,imageFormat:data['imageFormat'] as 'PNG'|'JPG'} : {})};
    if (this.#records.has(record.id)) throw new Error(`Duplicate external source: ${record.id}`);
    this.#records.set(record.id,record);
    return record;
  }
  get(id: string): ExternalSourceRecord {
    const record = this.#records.get(id);
    if (!record) throw new Error(`Unregistered external source: ${id}`);
    return record;
  }
  has(id: string): boolean { return this.#records.has(id); }
  parseView(config: unknown): ExternalView {
    let value: unknown = config;
    if (typeof config === 'string') {
      try { value = JSON.parse(config); } catch { throw new Error('Invalid encoded external view config'); }
    }
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('External view config must be an object');
    const item = value as Record<string, unknown>;
    const sourceId = item['sourceId'] ?? item['id'];
    if (typeof sourceId !== 'string') throw new Error('External view requires sourceId');
    this.get(sourceId);
    if (item['url'] !== undefined || item['auth'] !== undefined || item['accessToken'] !== undefined)
      throw new Error('External view cannot override registered URL or credentials');
    const opacity = item['opacity'];
    if (opacity !== undefined && (typeof opacity !== 'number' || opacity < 0 || opacity > 1 || !Number.isFinite(opacity)))
      throw new Error('External view opacity must be between 0 and 1');
    if (item['hidden'] !== undefined && typeof item['hidden'] !== 'boolean')
      throw new Error('External view hidden must be boolean');
    if (item['color'] !== undefined && (typeof item['color'] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(item['color'])))
      throw new Error('External view color must be a hex colour');
    return {id:sourceId,sourceId,
      ...(opacity === undefined ? {} : {opacity:opacity as number}),
      ...(item['hidden'] === undefined ? {} : {hidden:item['hidden'] as boolean}),
      ...(item['color'] === undefined ? {} : {color:item['color'] as string})};
  }
  rasterSource(record: ExternalSourceRecord): Record<string, unknown> {
    if (record.mapService === 'XYZ' || record.mapService === 'TMS')
      return {type:'raster',tiles:[record.url],tileSize:256,scheme:record.mapService.toLowerCase(),
        attribution:record.attribution};
    if (record.mapService !== 'WMS') throw new Error('Not a raster external source');
    const url = new URL(record.url);
    url.searchParams.set('service','WMS');
    url.searchParams.set('version','1.1.1');
    url.searchParams.set('request','GetMap');
    url.searchParams.set('layers',record.layers || '');
    url.searchParams.set('styles','');
    url.searchParams.set('format',record.imageFormat === 'JPG' ? 'image/jpeg' : 'image/png');
    url.searchParams.set('transparent','true');
    url.searchParams.set('srs','EPSG:3857');
    url.searchParams.set('width','256');
    url.searchParams.set('height','256');
    url.searchParams.set('bbox','{bbox-epsg-3857}');
    return {type:'raster',tiles:[url.toString().replace('%7Bbbox-epsg-3857%7D','{bbox-epsg-3857}')],
      tileSize:256,attribution:record.attribution};
  }
  async loadGeoJSON(record: ExternalSourceRecord, fetcher: typeof fetch = fetch,
    signal?: AbortSignal): Promise<FeatureCollection> {
    if (record.mapService !== 'GEOJSON_URL') throw new Error('Not a GeoJSON external source');
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),10000);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort',onAbort,{once:true});
    try {
      const response = await fetcher(record.url,{signal:controller.signal,credentials:'omit',mode:'cors'});
      if (!response.ok) throw new Error(`External GeoJSON request failed: ${response.status}`);
      const size = Number(response.headers.get('content-length'));
      if (Number.isFinite(size) && size > 2_000_000) throw new Error('External GeoJSON exceeds size limit');
      const body = await response.text();
      if (body.length > 2_000_000) throw new Error('External GeoJSON exceeds size limit');
      const parsed: unknown = JSON.parse(body);
      if (!parsed || typeof parsed !== 'object' || (parsed as FeatureCollection).type !== 'FeatureCollection' ||
        !Array.isArray((parsed as FeatureCollection).features) || (parsed as FeatureCollection).features.length > 10000)
        throw new Error('External GeoJSON must be a bounded FeatureCollection');
      return parsed as FeatureCollection;
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort',onAbort); }
  }
  async loadVectorStyle(record: ExternalSourceRecord, fetcher: typeof fetch = fetch,
    signal?: AbortSignal): Promise<Record<string, unknown>> {
    if (record.mapService !== 'VECTOR_STYLE') throw new Error('Not a vector style source');
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),10000);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort',onAbort,{once:true});
    try {
      const response = await fetcher(record.url,{signal:controller.signal,credentials:'omit',mode:'cors'});
      if (!response.ok) throw new Error(`External vector style request failed: ${response.status}`);
      const body = await response.text();
      if (body.length > 1_000_000) throw new Error('External vector style exceeds size limit');
      const style: unknown = JSON.parse(body);
      if (!style || typeof style !== 'object' || Array.isArray(style) ||
        (style as Record<string,unknown>)['version'] !== 8 ||
        !Array.isArray((style as Record<string,unknown>)['layers']))
        throw new Error('External vector style must be a MapLibre v8 style');
      const visit = (value: unknown, key = ''): void => {
        if (typeof value === 'string' && (key === 'url' || key === 'sprite' || key === 'glyphs' || key === 'tiles'))
          this.validateUrl(value,true);
        else if (Array.isArray(value)) for (const item of value) visit(item,key === 'tiles' ? 'tiles' : '');
        else if (value && typeof value === 'object')
          for (const [childKey, child] of Object.entries(value)) visit(child,childKey);
      };
      visit(style);
      return style as Record<string, unknown>;
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort',onAbort); }
  }
}
