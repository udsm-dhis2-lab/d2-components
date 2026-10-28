import { chartAnalyticsFixture, chartConfigurationFixture } from '../testing/fixtures/chart-characterization.fixtures';
import { chartCapabilities, chartCapability } from './chart-capabilities';
import { buildStandardChartOptions } from './standard-chart.transform';
import { AnalyticalBoundaryError } from './analytical-dataset';

const analytics = chartAnalyticsFixture();

describe('Sprint 15 capability matrix', () => {
  it.each(chartCapabilities.map(item => [item.key, item.status, item.types] as const))(
    '%s publishes %s with explicit type coverage', (key, status, types) => {
      expect(['supported', 'partial', 'rejected', 'deferred']).toContain(status);
      types.forEach(type => expect(chartCapability(type, key)?.key).toBe(key));
      if (status === 'rejected' || status === 'deferred') expect(types).toHaveLength(0);
    }
  );

  it('serializes modern axes, mixed series and accessible labels deterministically', () => {
    const config = chartConfigurationFixture('column', {
      axes: [
        { type: 'DOMAIN', index: 0, steps: 2, title: { textMode: 'CUSTOM', text: 'Month' } },
        { type: 'RANGE', index: 0, minValue: 0, maxValue: 100, steps: 5,
          title: { textMode: 'CUSTOM', text: 'Cases', fontStyle: { bold: true, fontSize: 14 } },
          targetLine: { value: 90, title: { text: 'Target' } } },
        { type: 'RANGE', index: 1, title: { text: 'Coverage (%)' }, baseLine: { value: 0, title: { text: 'Baseline' } } },
      ],
      series: [
        { dimensionItem: 'dx-a', axis: 0, type: 'COLUMN' },
        { dimensionItem: 'dx-b', axis: 1, type: 'LINE' },
      ],
      seriesKey: { hidden: false, label: { fontStyle: { bold: true } } },
      subtitle: 'By month',
    });
    const options = buildStandardChartOptions(analytics, config);
    expect(options.xAxis).toMatchObject({ tickInterval: 2, title: { text: 'Month' } });
    expect(options.yAxis).toMatchObject([
      { min: 0, max: 100, tickAmount: 6, title: { text: 'Cases', style: { fontWeight: 'bold', fontSize: '14px' } }, plotLines: [{ value: 90, label: { text: 'Target' } }] },
      { title: { text: 'Coverage (%)' }, plotLines: [{ value: 0, label: { text: 'Baseline' } }] },
    ]);
    expect(options.series).toMatchObject([{ type: 'column', yAxis: 0, name: 'Cases' }, { type: 'line', yAxis: 1, name: 'Coverage' }]);
    expect(options.legend).toMatchObject({ enabled: true, itemStyle: { fontWeight: 'bold' } });
    expect(options.subtitle).toBe('By month');
  });

  it.each(['stacked_column', 'stacked_bar', 'stacked_area'])(
    '%s distinguishes normal and percent stacking', type => {
      const normal = buildStandardChartOptions(analytics, chartConfigurationFixture(type));
      const percent = buildStandardChartOptions(analytics, chartConfigurationFixture(type, { percentStackedValues: true }));
      const engineType = type.split('_')[1];
      expect(normal.plotOptions[engineType].stacking).toBe('normal');
      expect(percent.plotOptions[engineType].stacking).toBe('percent');
    }
  );

  it('applies structured category sorting before hiding empty edge items', () => {
    const sparse = chartAnalyticsFixture({
      rows: [
        ['dx-a', '202402', 'ou-a', '4'],
        ['dx-b', '202402', 'ou-a', '0'],
      ],
    });
    const options = buildStandardChartOptions(sparse, chartConfigurationFixture('column', {
      sorting: [{ dimension: 'pe', direction: 'DESC' }],
      hideEmptyRowItems: 'ALL',
    }));
    expect(options.series[0].data).toHaveLength(1);
    expect(options.series[0].data[0].y).toBe(4);
    expect(options.xAxis.categories).toHaveLength(1);
  });

  it('accumulates decimal values without mutating input analytics', () => {
    const source = chartAnalyticsFixture();
    const original = JSON.parse(JSON.stringify(source));
    const options = buildStandardChartOptions(source, chartConfigurationFixture('line', {
      cumulativeValues: true,
    }));
    expect(source).toEqual(original);
    expect(options.series.find((item: { name: string }) => item.name === 'Coverage')?.data.map((point: { y: number }) => point.y))
      .toContain(4.5);
  });

  it('styles visible titles and hides the series key without dropping series names', () => {
    const options = buildStandardChartOptions(analytics, chartConfigurationFixture('line', {
      config: { type: 'line', title: 'Monthly cases', subtitle: 'Facility A',
        fontStyle: { visualizationTitle: { fontStyle: { bold: true, fontSize: 16 } },
          visualizationSubtitle: { fontStyle: { italic: true } } },
        seriesKey: { hidden: true } },
    }));
    expect(options.title).toMatchObject({ text: 'Monthly cases', style: { fontWeight: 'bold', fontSize: '16px' } });
    expect(options.subtitle).toMatchObject({ text: 'Facility A', style: { fontStyle: 'italic' } });
    expect(options.legend.enabled).toBe(false);
    expect(options.series.every((series: { name?: string }) => !!series.name)).toBe(true);
  });

  it.each([
    ['pie', { percentStackedValues: true }, 'percentStackedValues'],
    ['column', { topLimit: 2 }, 'topLimit'],
    ['column', { colorSet: 'UNKNOWN' }, 'colorSet'],
    ['column', { axes: [{ type: 'RANGE', index: 0, minValue: 5, maxValue: 4 }] }, 'maxValue'],
    ['column', { series: [{ dimensionItem: 'dx-a', axis: 2, type: 'LINE' }] }, 'axis'],
    ['column', { series: [{ dimensionItem: 'dx-a', axis: 0, type: 'SCATTER' }] }, 'type'],
    ['column', { series: [{ dimensionItem: 'dx-a', axis: 0, type: 'BAR' }] }, 'type'],
  ])('%s rejects invalid %s', (type, overrides, path) => {
    expect(() => buildStandardChartOptions(analytics, chartConfigurationFixture(type as string, overrides as Record<string, unknown>)))
      .toThrow(AnalyticalBoundaryError);
    try { buildStandardChartOptions(analytics, chartConfigurationFixture(type as string, overrides as Record<string, unknown>)); }
    catch (error) { expect(String(error)).toContain(path as string); }
  });
});
