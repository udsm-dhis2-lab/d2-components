import { FetchMapDataSource } from './map-data-source';

describe('FetchMapDataSource', () => {
  it('loads encoded GeoFeatures separately from analytics', async () => {
    const analytics = jest.fn().mockResolvedValue({ rows: [] });
    const fetcher = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [{ id: 'ou-a' }] });
    const source = new FetchMapDataSource(analytics, fetcher as never);
    const selections = [
      { dimension: 'ou', items: [{ id: 'ou-a' }, { dimensionItem: 'ou-b' }] },
    ];
    await expect(source.loadGeoFeatures(selections, '/dhis')).resolves.toEqual([
      { id: 'ou-a' },
    ]);
    expect(fetcher).toHaveBeenCalledWith(
      '/dhis/api/geoFeatures.json?ou=ou:ou-a;ou-b&displayProperty=NAME',
      { signal: undefined }
    );
    await source.loadAnalytics(selections);
    expect(analytics).toHaveBeenCalledWith(selections, undefined);
  });

  it('rejects unsuccessful GeoFeature responses', async () => {
    const source = new FetchMapDataSource(
      jest.fn(),
      jest.fn().mockResolvedValue({ ok: false, status: 503 }) as never
    );
    await expect(source.loadGeoFeatures([], '/dhis')).rejects.toThrow('503');
  });
});
