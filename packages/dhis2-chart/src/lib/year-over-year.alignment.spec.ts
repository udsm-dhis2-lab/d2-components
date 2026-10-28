/** @jest-environment node */
import { alignYearOverYear, parseYearPeriod } from './year-over-year.alignment';
import { buildYearOverYearChartModel } from './year-over-year.model';
import { HighchartsOptionsAdapter } from './highcharts-options.adapter';

const values = (rows: string[][]) => ({ headers: [{ name: 'pe' }, { name: 'value' }], rows, metaData: {} });
const axis = { year: 2024, relativePeriodDate: '2024-12-31', periodIds: ['2024W01', '2024W02'], categories: ['W01', 'W02'], meta: values([]) };

describe('pure year-over-year alignment', () => {
  it.each([
    ['2024W53', 'WEEK', 53], ['2024W01', 'WEEK', 1],
    ['202401', 'MONTH', 1], ['2024Q4', 'QUARTER', 4],
  ])('parses %s', (id, type, index) => {
    expect(parseYearPeriod(id)).toEqual({ year: 2024, type, index });
  });
  it('keeps null distinct from zero, incomplete years and week 53 deterministic', () => {
    const years = [
      { year: 2023, values: values([['2023W01', '0'], ['2023W53', '5']]) },
      { year: 2024, values: values([['2024W01', '7']]) },
    ];
    const before = JSON.stringify(years);
    const aligned = alignYearOverYear(years, ['2024W01', '2024W02', '2024W53']);
    expect(aligned.categories).toEqual(['W1', 'W2', 'W53']);
    expect(aligned.series.map(series => series.data)).toEqual([[0, null, 5], [7, null, null]]);
    expect(alignYearOverYear(years, ['2024W01', '2024W02', '2024W53'], { week53: 'omit' }).categories).toEqual(['W1', 'W2']);
    expect(JSON.stringify(years)).toBe(before);
  });
  it('rejects mixed periods and invalid values', () => {
    expect(() => alignYearOverYear([], ['2024W01', '202401'])).toThrow('Mixed');
    expect(() => alignYearOverYear([{ year: 2024, values: values([['2024W01', 'NaN']]) }], ['2024W01'])).toThrow('Invalid');
  });
  it.each([
    ['MONTH', ['202402', '202401'], [['202401', '4']], ['02', '01'], [null, 4]],
    ['QUARTER', ['2024Q2', '2024Q1'], [['2024Q1', '4']], ['Q2', 'Q1'], [null, 4]],
  ] as const)('aligns %s while preserving metadata order', (_type, ids, rows, categories, data) => {
    const aligned = alignYearOverYear([{ year: 2024, values: values(rows.map(row => [...row])) }], ids);
    expect(aligned.categories).toEqual(categories);
    expect(aligned.series[0].data).toEqual(data);
  });
  it.each([['YEAR_OVER_YEAR_LINE', 'line'], ['YEAR_OVER_YEAR_COLUMN', 'column']] as const)(
    '%s uses the standard chart model and Highcharts serializer', (type, chartType) => {
      const model = buildYearOverYearChartModel({ axis, series: [{ name: '2024', year: 2024, data: [3, null] }] },
        { config: { displayName: 'Trend' } }, type);
      const options = new HighchartsOptionsAdapter().toOptions(model);
      expect(model.kind).toBe('CHART_MODEL');
      expect(options.chart?.type).toBe(chartType);
      expect(options.xAxis).toMatchObject({ categories: ['W1', 'W2'] });
      expect(options.series).toMatchObject([{ type: chartType, name: '2024', data: [{ y: 3 }, { y: null }] }]);
    }
  );
});
