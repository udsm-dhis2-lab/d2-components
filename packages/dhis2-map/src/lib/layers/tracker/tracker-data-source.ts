import type { TrackerDataSource, TrackerLayerSelection } from './tracker-map-layer';
import { trackerRequest } from './tracker-map-layer';

export class FetchTrackerDataSource implements TrackerDataSource {
  constructor(private readonly fetcher: typeof fetch = fetch) {}
  async loadTrackedEntities(selection: TrackerLayerSelection, baseUrl: string, signal?: AbortSignal): Promise<readonly unknown[]> {
    if (selection.locationAccess !== 'precise') throw new Error('Precise tracked-entity location access is required');
    const records: unknown[] = [];
    for (let page = 1; page <= 20; page++) {
      if (signal?.aborted) throw new DOMException('Tracked-entity load aborted','AbortError');
      const response = await this.fetcher.call(globalThis,`${baseUrl}${trackerRequest(selection,page)}`,{signal,cache:'no-store'});
      if (!response.ok) throw new Error(`Tracked-entity request failed with ${response.status}`);
      const payload = await response.json() as {trackedEntities?:unknown;pager?:{pageCount?:unknown}};
      if (!Array.isArray(payload?.trackedEntities)) throw new TypeError('Invalid tracked-entity response');
      records.push(...payload.trackedEntities);
      if (payload.pager?.pageCount !== undefined) {
        if (!Number.isInteger(payload.pager.pageCount) || (payload.pager.pageCount as number) < page ||
            (payload.pager.pageCount as number) > 20)
          throw new Error('Tracked-entity page limit exceeded or invalid pager');
        if (page >= (payload.pager.pageCount as number)) return records;
      } else if (payload.trackedEntities.length < 100) return records;
    }
    throw new Error('Tracked-entity response exceeded 2000-record safety limit');
  }
}
