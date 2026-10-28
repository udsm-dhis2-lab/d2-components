/** @jest-environment node */
import { buildStandardChartModel } from './standard-chart.model';
import { HighchartsOptionsAdapter } from './highcharts-options.adapter';
import { chartConfigurationFixture, multidimensionalAnalyticsFixture, chartAnalyticsFixture } from '../testing/fixtures/chart-characterization.fixtures';

describe('native multidimensional categories', () => {
  const adapter = new HighchartsOptionsAdapter();
  const config = (type = 'column', overrides: Record<string, unknown> = {}) =>
    chartConfigurationFixture(type, { xAxisType: ['pe', 'ou'], yAxisType: 'dx', ...overrides });

  it.each(['column', 'bar'])('serializes %s as linked native axes with full export keys', type => {
    const analytics = multidimensionalAnalyticsFixture();
    const before = JSON.stringify(analytics);
    const model = buildStandardChartModel(analytics, config(type));
    expect(model.categoryAxis?.categoryTuples).toEqual([
      { leaf: 'Facility A', parent: 'January 2024' },
      { leaf: 'Facility B', parent: 'January 2024' },
      { leaf: 'Facility A', parent: 'February 2024' },
      { leaf: 'Facility B', parent: 'February 2024' },
    ]);
    const options = adapter.toOptions(model);
    expect(options.chart?.type).toBe(type);
    expect(Array.isArray(options.xAxis)).toBe(true);
    const axes = options.xAxis as any[];
    expect(axes[0].categories).toEqual([
      'January 2024 — Facility A', 'January 2024 — Facility B',
      'February 2024 — Facility A', 'February 2024 — Facility B',
    ]);
    expect(axes[1]).toMatchObject({ linkedTo: 0, opposite: true, tickPositions: [0.5, 2.5] });
    expect(axes[0].labels.formatter.call({ pos: 0 })).toBe('Facility A');
    expect(axes[1].labels.formatter.call({ pos: 2.5 })).toBe('February 2024');
    expect(axes[0].tickLength).toBe(0);
    expect(axes[1].tickLength).toBe(0);
    expect(axes[0].labels.style.fontSize).toBe('11px');
    expect(axes[0].labels.style.color).toBe('#404b5a');
    expect(axes[1].labels.style.color).toBe('#404b5a');
    expect(axes[1].labels).toMatchObject({ rotation: 0, autoRotation: [0], style: { fontSize: '11px', whiteSpace: 'normal', width: 120 } });
    expect(axes[0].plotLines).toEqual([{ value: 1.5, color: '#d9dfe5', width: 1, zIndex: 1 }]);
    expect(model.series[0].points[0].name).toBe('January 2024 — Facility A');
    expect(JSON.stringify(analytics)).toBe(before);
  });

  it('preserves distinct repeated parents, missing combinations and translated labels', () => {
    const analytics = multidimensionalAnalyticsFixture();
    analytics.metaData.names['202401'] = 'Januari_ya kwanza';
    analytics.metaData.names['ou-a'] = 'Kituo A';
    analytics.rows = analytics.rows.filter(row => !(row[1] === '202402' && row[2] === 'ou-b'));
    const model = buildStandardChartModel(analytics, config('column', { sortOrder: 1 }));
    const tuples = model.categoryAxis?.categoryTuples ?? [];
    expect(tuples).toHaveLength(4);
    expect(tuples.some(tuple => tuple.leaf === 'Kituo A' && tuple.parent === 'Januari_ya kwanza')).toBe(true);
    const options = adapter.toOptions(model);
    const axes = options.xAxis as any[];
    expect(axes[0].categories).toHaveLength(4);
    expect(axes[1].tickPositions.length).toBeGreaterThanOrEqual(2);
    expect((options.series?.[0] as any).data).toHaveLength(4);
  });

  it('labels non-contiguous repeated parent runs separately', () => {
    const base = buildStandardChartModel(chartAnalyticsFixture(), chartConfigurationFixture('column'));
    const model = {
      ...base,
      categoryAxis: {
        ...base.categoryAxis,
        categories: ['One', 'Two', 'Three'],
        categoryTuples: [
          { leaf: 'One', parent: 'A' },
          { leaf: 'Two', parent: 'B' },
          { leaf: 'Three', parent: 'A' },
        ],
      },
    };
    const axes = adapter.toOptions(model).xAxis as any[];
    expect(axes[1].tickPositions).toEqual([0, 1, 2]);
    expect(axes[0].plotLines.map((line: { value: number }) => line.value)).toEqual([0.5, 1.5]);
    expect(axes[1].tickPositions.map((pos: number) => axes[1].labels.formatter.call({ pos }))).toEqual(['A', 'B', 'A']);
  });

  it('keeps one-dimensional categories as a single baseline-compatible string axis', () => {
    const model = buildStandardChartModel(chartAnalyticsFixture(), chartConfigurationFixture('column'));
    const options = adapter.toOptions(model);
    expect(model.categoryAxis?.categoryTuples).toBeUndefined();
    expect(Array.isArray(options.xAxis)).toBe(false);
    expect((options.xAxis as any).categories).toEqual(['January 2024', 'February 2024']);
    expect((options.xAxis as any).labels.style.fontSize).toBe('11px');
    expect((options.xAxis as any).labels.style.color).toBe('#404b5a');
  });
});
