import {
  D2AnalyticsFacade,
  FunctionAnalyticsDataSource,
  normalizeAnalyticsResponse,
} from './analytics.facade';
import { Fn } from '@iapps/function-analytics';

const raw = {
  headers: [{ name: 'dx' }, { name: 'value' }],
  rows: [['dx-a', '42']],
  metaData: {
    dimensions: { dx: ['dx-a'] },
    items: { 'dx-a': { name: 'Data element A' } },
  },
};

describe('aggregate analytics facade', () => {
  it('unwraps the function-analytics result without converting rows to objects', () => {
    const wrapped = {
      _data: raw,
      get rows() {
        return raw.rows.map((row) => ({ row, value: row[1] }));
      },
    };
    const normalized = normalizeAnalyticsResponse(wrapped);
    expect(normalized.rows[0][1]).toBe('42');
    expect(normalized.metaData['dx']).toEqual(['dx-a']);
    expect(normalized.metaData.names).toEqual({
      'dx-a': 'Data element A',
    });
  });

  it('converts selection items and normalizes injected data-source results', async () => {
    const getAnalytics = jest.fn().mockResolvedValue({ _data: raw });
    const facade = new D2AnalyticsFacade({ getAnalytics }).setSelections([
      { dimension: 'dx', items: [{ id: 'dx-a' }] },
      { dimension: 'pe', items: [{ dimensionItem: 'LAST_YEAR' }] },
    ]);

    await expect(facade.getData()).resolves.toMatchObject({ rows: raw.rows });
    expect(getAnalytics).toHaveBeenCalledWith(
      {
        selections: [
          { dimension: 'dx', items: ['dx-a'] },
          { dimension: 'pe', items: ['LAST_YEAR'] },
        ],
      },
      undefined
    );
  });

  it('can clear supplied data so changed selections fetch fresh analytics', async () => {
    const fresh = { ...raw, rows: [['dx-b', '84']] };
    const getAnalytics = jest.fn().mockResolvedValue(fresh);
    const facade = new D2AnalyticsFacade({ getAnalytics })
      .setData(raw)
      .setSelections([{ dimension: 'dx', items: [{ id: 'dx-b' }] }])
      .clearData();

    await expect(facade.getData()).resolves.toMatchObject({ rows: fresh.rows });
    expect(getAnalytics).toHaveBeenCalledTimes(1);
  });

  it('encodes filtered periods separately from analytics response dimensions', async () => {
    const get = jest.spyOn(Fn.Analytics.prototype, 'get').mockResolvedValue(raw);
    const setParameters = jest.spyOn(Fn.Analytics.prototype, 'setParameters');
    try {
      await new FunctionAnalyticsDataSource().getAnalytics({
        selections: [{ dimension: 'dx', items: ['x', 'y'] }, { dimension: 'ou', items: ['LEVEL-2'] }],
        filters: [{ dimension: 'pe', items: ['LAST_12_MONTHS'] }],
      });
      expect(setParameters).toHaveBeenCalledWith({ filter: { pe: 'LAST_12_MONTHS' } });
      expect(setParameters.mock.instances[0].url).toContain('filter=pe:LAST_12_MONTHS');
      expect(setParameters.mock.instances[0].url).not.toContain('dimension=pe:');
    } finally {
      get.mockRestore();
      setParameters.mockRestore();
    }
  });
});
