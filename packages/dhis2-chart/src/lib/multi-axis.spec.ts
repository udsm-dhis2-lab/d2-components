import { multiAxisAnalyticsFixture, mixedAxisConfigurationFixture, threeAxisConfigurationFixture } from '../testing/fixtures/multi-axis.fixtures';
import { buildStandardChartModel } from './standard-chart.model';
import { buildStandardChartOptions } from './standard-chart.transform';
import { AnalyticalBoundaryError } from './analytical-dataset';
import { inferredRangeAxisIndexes, inferredRangeAxisPlacement } from './chart/transforms/range-axis.transforms';

describe('Sprint 20 multi-axis contract', () => {
  const analytics = multiAxisAnalyticsFixture();

  it('resolves the supplied three-axis shape without explicit axes', () => {
    const configuration = threeAxisConfigurationFixture();
    const original = JSON.parse(JSON.stringify(configuration));
    const model = buildStandardChartModel(analytics, configuration);
    const options = buildStandardChartOptions(analytics, configuration);
    expect(configuration).toEqual(original);
    expect(model.valueAxes).toHaveLength(3);
    expect(model.series.map(series => series.axisIndex)).toEqual([0, 0, 1, 2, 2]);
    expect(options.yAxis).toHaveLength(3);
    expect(options.yAxis.map((axis: { opposite: boolean; offset: number }) => [axis.opposite, axis.offset]))
      .toEqual([[false, 0], [true, 0], [false, 48]]);
    expect(options.series.slice(0, 5).map((series: { yAxis: number; type: string }) => [series.yAxis, series.type]))
      .toEqual([[0, 'column'], [0, 'column'], [1, 'column'], [2, 'column'], [2, 'column']]);
    expect(options.series[0].data.map((point: { y: number }) => point.y)).toContain(100);
    expect(options.series[0].data.map((point: { y: number }) => point.y)).toContain(0);
  });

  it('preserves the supplied column/line combination on independent axes', () => {
    const mixedAnalytics = multiAxisAnalyticsFixture(['coverage-1', 'coverage-2', 'coverage-3', 'visit-1', 'visit-2', 'visit-3']);
    const model = buildStandardChartModel(mixedAnalytics, mixedAxisConfigurationFixture());
    const options = buildStandardChartOptions(mixedAnalytics, mixedAxisConfigurationFixture());
    expect(model.valueAxes).toHaveLength(2);
    expect(model.series.map(series => [series.kind, series.axisIndex])).toEqual([
      ['column', 0], ['column', 0], ['column', 0], ['line', 1], ['line', 1], ['line', 1],
    ]);
    expect(options.yAxis).toHaveLength(2);
    expect(options.series.slice(0, 6).map((series: { type: string; yAxis: number }) => [series.type, series.yAxis]))
      .toEqual([['column', 0], ['column', 0], ['column', 0], ['line', 1], ['line', 1], ['line', 1]]);
  });

  it('resolves sparse axis slots without mutating source series', () => {
    const series = Object.freeze([{ axis: 2 }, { axis: 0 }]);
    expect(inferredRangeAxisIndexes(series)).toEqual([0, 1, 2]);
    expect(inferredRangeAxisPlacement(2)).toEqual({ opposite: false, offset: 48 });
    expect(series).toEqual([{ axis: 2 }, { axis: 0 }]);
  });

  it('keeps zero distinct from a missing observation on inferred axes', () => {
    const sparse = multiAxisAnalyticsFixture();
    const rows = sparse.rows.filter(row => !(row[2] === 'visit-2' && row[1] === '202402'));
    const options = buildStandardChartOptions({ ...sparse, rows }, threeAxisConfigurationFixture());
    const byName = new Map(options.series.map((series: { name: string; data: { y: number | null }[] }) => [series.name, series.data]));
    expect((byName.get('First visits') as { y: number | null }[]).map(point => point.y)).toContain(0);
    expect((byName.get('Second visits') as { y: number | null }[]).map(point => point.y)).toContain(null);
  });

  it('retains an explicit null and rejects a non-finite observation', () => {
    const source = multiAxisAnalyticsFixture();
    const rows = source.rows.map(row => row[2] === 'visit-2' && row[1] === '202402'
      ? ['null', ...row.slice(1)] : row);
    const options = buildStandardChartOptions({ ...source, rows }, threeAxisConfigurationFixture());
    expect(options.series[1].data.map((point: { y: number | null }) => point.y)).toContain(null);
    const invalidRows = rows.map(row => row[2] === 'visit-2' && row[1] === '202402'
      ? ['Infinity', ...row.slice(1)] : row);
    expect(() => buildStandardChartOptions({ ...source, rows: invalidRows }, threeAxisConfigurationFixture()))
      .toThrow('rows[3][0]');
  });

  it.each([
    [[{ dimensionItem: 'visit-1', axis: -1 }], 'series[0].axis'],
    [[{ dimensionItem: 'visit-1', axis: 1.5 }], 'series[0].axis'],
    [[{ dimensionItem: 'visit-1', axis: 0 }, { dimensionItem: 'visit-1', axis: 1 }], 'series[1].dimensionItem'],
  ])('rejects invalid series configuration at %s', (series, path) => {
    expect(() => buildStandardChartModel(analytics, { ...threeAxisConfigurationFixture(), series }))
      .toThrow(AnalyticalBoundaryError);
    try { buildStandardChartModel(analytics, { ...threeAxisConfigurationFixture(), series }); }
    catch (error) { expect(String(error)).toContain(path); }
  });

  it('rejects a series referring to an item absent from the analytics layout', () => {
    expect(() => buildStandardChartModel(analytics, {
      ...threeAxisConfigurationFixture(), series: [{ dimensionItem: 'missing', axis: 1 }],
    })).toThrow('configuration.series[0].dimensionItem');
  });
});
