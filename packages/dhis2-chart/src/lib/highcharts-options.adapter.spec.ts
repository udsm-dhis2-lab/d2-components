import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
} from '../testing/fixtures/chart-characterization.fixtures';
import {
  buildStandardChartModel,
  buildStandardChartOptions,
} from './standard-chart.transform';
import {
  HighchartsOptionsAdapter,
  requiredModulesForOptions,
} from './highcharts-options.adapter';

describe('Highcharts options adapter', () => {
  const adapter = new HighchartsOptionsAdapter();

  it('serializes the neutral model without changing it', () => {
    const model = buildStandardChartModel(
      chartAnalyticsFixture(),
      chartConfigurationFixture('line')
    );
    const before = JSON.stringify(model);
    const options = adapter.toOptions(model);
    expect(options).toEqual(
      buildStandardChartOptions(
        chartAnalyticsFixture(),
        chartConfigurationFixture('line')
      )
    );
    expect(options.series?.every((series) => !!series.type)).toBe(true);
    expect(requiredModulesForOptions(options)).toEqual(model.requiredModules);
    options.series?.splice(0, 1);
    expect(JSON.stringify(model)).toBe(before);
  });

  it('emits explicit pie discriminants for parent and drilldown series', () => {
    const options = adapter.toOptions(
      buildStandardChartModel(
        chartAnalyticsFixture(),
        chartConfigurationFixture('pie')
      )
    );
    expect(options.series?.[0].type).toBe('pie');
    expect(
      options.drilldown?.series?.every((series) => series.type === 'pie')
    ).toBe(true);
  });

  it('reports missing optional modules by name', () => {
    const model = buildStandardChartModel(
      chartAnalyticsFixture(),
      chartConfigurationFixture('solidgauge')
    );
    expect(() =>
      adapter.assertModulesAvailable(model, [
        'exporting',
        'offline-exporting',
        'export-data',
      ])
    ).toThrow(
      'solidgauge requires Highcharts module(s): highcharts-more, solid-gauge'
    );
  });

  it('serializes year-over-year lines with explicit series types', () => {
    const model = {
      kind: 'YEAR_OVER_YEAR_CHART_MODEL' as const,
      categories: ['W1', 'W2'],
      series: [{ name: '2024', data: [1, null] }],
      palette: ['#123456'],
      title: 'Trend',
      subtitle: 'Facility - Cases',
      showLegend: true,
      showData: false,
      digitGroupSeparator: 'SPACE' as const,
      skipRounding: false,
      tickStep: 1,
      currentYear: 2024,
      requiredModules: [
        'exporting',
        'offline-exporting',
        'export-data',
      ] as const,
    };
    const onLoad = jest.fn();
    const target = document.createElement('div');
    const options = adapter.toYearOverYearOptions(model, target, onLoad);
    expect(options.chart).toMatchObject({
      renderTo: target,
      type: 'line',
      spacingTop: 22,
    });
    expect(options.series?.[0]).toMatchObject({
      type: 'line',
      data: [1, null],
      lineWidth: 2.8,
    });
    expect(options.xAxis).toMatchObject({ categories: ['W1', 'W2'] });
    expect(requiredModulesForOptions(options)).toEqual(model.requiredModules);
    expect(model.series[0].data).toEqual([1, null]);
  });
});
