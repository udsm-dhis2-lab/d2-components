import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
} from '../../../testing/fixtures/chart-characterization.fixtures';
import {
  accumulateAnalytics,
  applySeriesOptions,
  buildSeriesMatrix,
  combineSeriesData,
  filterEmptySeriesPoints,
  limitCategories,
  refineCategories,
  resolveLayout,
  resolveSeriesColors,
  sortSeries,
} from './analytical.transforms';
import {
  buildDataLabelOptions,
  buildLegendOptions,
  buildReferenceLines,
  buildTitleOptions,
  buildTooltipOptions,
  formatAxisNumber,
  resolveStacking,
} from './presentation.transforms';

describe('pure chart transformations', () => {
  it('resolves ordered layout tuples and the series matrix without input mutation', () => {
    const analytics = chartAnalyticsFixture();
    const configuration = { ...chartConfigurationFixture(), yAxisType: 'dx' };
    const before = JSON.stringify({ analytics, configuration });
    const layout = resolveLayout(analytics, configuration);
    expect(layout.xAxisItems.map((item) => item.id)).toEqual([
      '202401',
      '202402',
    ]);
    expect(layout.yAxisItems.map((item) => item.id)).toEqual(['dx-a', 'dx-b']);
    const series = buildSeriesMatrix(analytics, layout, configuration);
    expect(series[0].data.map((point) => point.y)).toEqual([10, 0]);
    expect(series[1].data.map((point) => point.y)).toEqual([3.5, 4.5]);
    expect(JSON.stringify({ analytics, configuration })).toBe(before);
  });

  it('combines then sorts categories using aggregate values, preserving each series', () => {
    const input = [
      {
        id: 'one',
        data: [
          { id: 'a', y: 2 },
          { id: 'b', y: 8 },
        ],
      },
      {
        id: 'two',
        data: [
          { id: 'a', y: 3 },
          { id: 'b', y: 1 },
        ],
      },
    ];
    const before = JSON.stringify(input);
    expect(
      combineSeriesData(input.map((item) => item.data)).map((point) => point.y)
    ).toEqual([5, 9]);
    expect(sortSeries(input, 1)[0].data.map((point) => point.id)).toEqual([
      'b',
      'a',
    ]);
    expect(sortSeries(input, -1)[0].data.map((point) => point.id)).toEqual([
      'a',
      'b',
    ]);
    expect(JSON.stringify(input)).toBe(before);
    const sorted = sortSeries(input, 1);
    sorted[0].data[0].y = 999;
    expect(input[0].data[1].y).toBe(8);
  });

  it('retains the legacy cumulative traversal order and leaves rows untouched', () => {
    const input = chartAnalyticsFixture();
    const before = JSON.stringify(input);
    const result = accumulateAnalytics(input, 'pe', 'dx');
    expect(
      result.rows
        .filter((row: any[]) => row[0] === 'dx-a')
        .map((row: any[]) => row[3])
    ).toEqual([0, 10]);
    expect(JSON.stringify(input)).toBe(before);
  });

  it('applies series color and axis options without mutating points', () => {
    const input = [{ id: 'dx-a', type: 'column', data: [{ id: 'a', y: 2 }] }];
    const result = applySeriesOptions(input, [
      { dimensionItem: 'dx-a', type: 'line', axix: 1, color: '#123456' },
    ]);
    expect(result[0]).toMatchObject({
      type: 'line',
      yAxis: 1,
      data: [{ color: '#123456' }],
    });
    expect(input[0].data[0]).not.toHaveProperty('color');
    result[0].data[0].y = 99;
    expect(input[0].data[0].y).toBe(2);
    expect(resolveSeriesColors(result, ['#fff'])).toEqual(['#123456']);
  });

  it('refines grouped categories and filters only common empty indexes', () => {
    expect(
      refineCategories([
        {
          data: [
            { name: 'January_Facility A' },
            { name: 'February_Facility A' },
          ],
        },
      ])
    ).toEqual([{ name: 'Facility A', categories: ['January', 'February'] }]);
    const chart = {
      series: [
        {
          data: [
            { id: 'a', y: '' },
            { id: 'b', y: 3 },
          ],
        },
        {
          data: [
            { id: 'a', y: '' },
            { id: 'b', y: 4 },
          ],
        },
      ],
      xAxis: { categories: [{ name: 'A' }, { name: 'B' }] },
    };
    const before = JSON.stringify(chart);
    expect(
      filterEmptySeriesPoints(chart, {}).series.map(
        (item: any) => item.data.length
      )
    ).toEqual([1, 1]);
    expect(JSON.stringify(chart)).toBe(before);
    expect(limitCategories(['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
  });

  it('builds presentation options without Highcharts or browser APIs', () => {
    expect(
      buildTitleOptions(
        chartConfigurationFixture(),
        chartAnalyticsFixture().metaData
      )
    ).toHaveProperty('text', '');
    expect(
      buildLegendOptions({ legendAlign: 'right', reverseLegend: true })
    ).toMatchObject({ layout: 'vertical', reversed: true });
    expect(
      buildDataLabelOptions({ type: 'pie', showData: true })
    ).toHaveProperty('enabled', true);
    expect(
      buildTooltipOptions({ type: 'stacked_column' }, 'column')
    ).toHaveProperty(
      'pointFormat',
      '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    );
    expect(resolveStacking({ type: 'area', percentStackedValues: false })).toBe(
      'normal'
    );
    expect(formatAxisNumber(0)).toBe('{value:.0f}');
    expect(buildReferenceLines({ targetLineValue: 5 })[0].value).toBe(5);
  });
});
