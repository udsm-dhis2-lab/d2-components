import { FetchMapDataSource, normalizeMapAnalytics } from './map-data-source';

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

  it('calls browser-native fetch with the global binding', async () => {
    const fetcher = jest.fn(function (this: unknown) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve({ ok: true, json: async () => [] });
    });
    const source = new FetchMapDataSource(jest.fn(), fetcher as never);
    await expect(source.loadGeoFeatures([], '/dhis')).resolves.toEqual([]);
    expect(fetcher.mock.instances[0]).toBe(globalThis);
  });

  it('normalizes DHIS2 header/array analytics and retains zero', async () => {
    const source = new FetchMapDataSource(jest.fn().mockResolvedValue({ data: {
      headers: [{ name: 'dx' }, { name: 'ou' }, { name: 'value' }],
      rows: [['measure-a', 'ou-a', '12'], ['measure-a', 'ou-b', '0']],
    } }), jest.fn() as never);
    await expect(source.loadAnalytics([])).resolves.toEqual({ rows: [
      { ou: { id: 'ou-a' }, value: 12 }, { ou: { id: 'ou-b' }, value: 0 },
    ] });
  });

  it('rejects ambiguous array analytics without named ou/value headers', () => {
    expect(() => normalizeMapAnalytics({ headers: [{ name: 'dx' }], rows: [['x']] }))
      .toThrow('ou and value');
  });
});
