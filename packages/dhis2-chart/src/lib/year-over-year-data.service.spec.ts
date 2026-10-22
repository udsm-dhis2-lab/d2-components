import {
  AnalyticsQuery,
  AnalyticsResponse,
  VisualizationDataSource,
} from './core';
import {
  buildYearOverYearSeries,
  YearOverYearDataService,
} from './year-over-year-data.service';

describe('year-over-year data module', () => {
  it('aligns values to the latest axis with a pure transformation', () => {
    expect(
      buildYearOverYearSeries(
        [
          {
            year: 2023,
            values: response({}, [
              ['2023W1', '10'],
              ['2023W2', '20'],
            ]),
          },
          { year: 2024, values: response({}, [['2024W1', '30']]) },
        ],
        ['2024W1', '2024W2']
      )
    ).toEqual([
      { name: '2023', year: 2023, data: [10, 20] },
      { name: '2024', year: 2024, data: [30, 0] },
    ]);
  });

  it('loads through an injected data source without browser globals', async () => {
    const source = new QueueDataSource([
      response({ pe: ['2023'] }),
      response({ pe: ['2023W1'] }, [], { '2023W1': { name: 'Week 1' } }),
      response({}, [['2023W1', '7']]),
    ]);
    const bundle = await new YearOverYearDataService(source).load({
      dxId: 'dx-a',
      ouId: 'ou-a',
      relativePeriodDate: '2024-06-01',
    });
    expect(source.queries).toHaveLength(3);
    expect(source.queries[2].parameters).toEqual({
      displayProperty: 'NAME',
      skipMeta: true,
      skipData: false,
    });
    expect(bundle.axis.categories).toEqual(['Week 1']);
    expect(bundle.series[0].data).toEqual([7]);
  });
});

class QueueDataSource implements VisualizationDataSource {
  queries: AnalyticsQuery[] = [];
  constructor(private readonly responses: AnalyticsResponse[]) {}
  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsResponse> {
    this.queries.push(query);
    return this.responses.shift() as AnalyticsResponse;
  }
}

function response(
  dimensions: Record<string, string[]>,
  rows: string[][] = [],
  items: Record<string, any> = {}
): AnalyticsResponse {
  return {
    headers: [{ name: 'pe' }, { name: 'value' }],
    rows,
    metaData: { dimensions, items },
  };
}
