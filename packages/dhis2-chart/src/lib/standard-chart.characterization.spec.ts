import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
  CURRENT_STANDARD_CHART_TYPES,
  multidimensionalAnalyticsFixture,
  valueStateAnalyticsFixtures,
} from '../testing/fixtures/chart-characterization.fixtures';
import { buildStandardChartOptions } from './standard-chart.transform';

describe('standard chart option characterization', () => {
  it.each(CURRENT_STANDARD_CHART_TYPES)(
    'maps current %s configuration to Highcharts %s',
    (type, highchartsType) => {
      const options = buildStandardChartOptions(
        chartAnalyticsFixture(),
        chartConfigurationFixture(type)
      );

      expect(options.chart).toMatchObject({
        renderTo: 'chart-fixture',
        type: highchartsType,
        zoomType: 'xy',
      });
      expect(options.series).toHaveLength(2);
      expect(options.series.map((series: { type: string }) => series.type)).toEqual(
        [highchartsType, highchartsType]
      );
    }
  );

  it('characterizes dotted-line presentation', () => {
    const options = buildStandardChartOptions(
      chartAnalyticsFixture(),
      chartConfigurationFixture('dotted')
    );

    expect(options.plotOptions.line).toMatchObject({
      lineWidth: 0,
      states: { hover: { enabled: false } },
    });
  });

  it.each([
    ['stacked_column', 'column'],
    ['stacked_bar', 'bar'],
  ])('characterizes normal and percent stacking for %s', (type, plotType) => {
    const normal = buildStandardChartOptions(
      chartAnalyticsFixture(),
      chartConfigurationFixture(type)
    );
    const percent = buildStandardChartOptions(
      chartAnalyticsFixture(),
      chartConfigurationFixture(type, { percentStackedValues: true })
    );

    expect(normal.plotOptions[plotType].stacking).toBe('normal');
    expect(percent.plotOptions[plotType].stacking).toBe('percent');
  });

  it('characterizes the radar branch', () => {
    const options = buildStandardChartOptions(
      chartAnalyticsFixture(),
      chartConfigurationFixture('radar')
    );

    expect(options.chart).toMatchObject({ type: 'line', polar: true });
    expect(options.pane).toEqual({ size: '80%' });
    expect(options.xAxis).toMatchObject({
      tickmarkPlacement: 'on',
      lineWidth: 0,
    });
    expect(options.yAxis[0]).toMatchObject({
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
    });
  });

  it.each(['solidgauge', 'gauge'])(
    'characterizes the %s gauge branch',
    (type) => {
      const options = buildStandardChartOptions(
        chartAnalyticsFixture(),
        chartConfigurationFixture(type)
      );

      expect(options.pane).toMatchObject({
        center: ['50%', '85%'],
        startAngle: -90,
        endAngle: 90,
      });
      expect(options.series).toHaveLength(2);
      expect(options.series[0].type).toBe('solidgauge');
    }
  );

  it('characterizes pie drilldown with multiple data items', () => {
    const options = buildStandardChartOptions(
      chartAnalyticsFixture(),
      chartConfigurationFixture('pie')
    );

    expect(options.chart).toMatchObject({
      type: 'pie',
      plotBackgroundColor: null,
      plotShadow: false,
    });
    expect(options.series).toHaveLength(1);
    expect(options.series[0].data).toEqual([
      expect.objectContaining({ name: 'Cases', drilldown: 'dx-a' }),
      expect.objectContaining({ name: 'Coverage', drilldown: 'dx-b' }),
    ]);
    expect(options.drilldown.series).toHaveLength(2);
  });

  it.todo('preserves both labels for two category dimensions');

  it('characterizes current domain/range axes and mixed series mapping', () => {
    const options = buildStandardChartOptions(
      chartAnalyticsFixture(),
      chartConfigurationFixture('column', {
        axes: [
          {
            type: 'DOMAIN',
            decimals: 0,
            title: { text: 'Period', fontStyle: { textAlign: 'LEFT' } },
            label: { fontStyle: { bold: true } },
          },
          {
            type: 'RANGE',
            decimals: 1,
            title: { text: 'Cases', fontStyle: { textAlign: 'RIGHT' } },
          },
          { type: 'RANGE', title: { text: 'Coverage' } },
        ],
        seriesOptions: [
          { dimensionItem: 'dx-a', type: 'line' },
          { dimensionItem: 'dx-b', type: 'column', axix: 1 },
        ],
      })
    );

    expect(options.xAxis).toMatchObject({
      allowDecimals: true,
      title: { text: 'Period', align: 'low' },
    });
    expect(options.yAxis).toHaveLength(2);
    expect(options.series[0]).toMatchObject({ type: 'line', yAxis: 0 });
    expect(options.series[1]).toMatchObject({ type: 'column', yAxis: 1 });
  });

  it('keeps input analytics immutable for multidimensional options', () => {
    const analytics = multidimensionalAnalyticsFixture();
    const before = JSON.parse(JSON.stringify(analytics));

    buildStandardChartOptions(
      analytics,
      chartConfigurationFixture('column', { xAxisType: ['pe', 'ou'] })
    );

    expect(analytics).toEqual(before);
  });

  describe('known defects awaiting separate behavior fixes', () => {
    it('keeps distinct raw fixtures for absent, zero, null and malformed data', () => {
      const states = valueStateAnalyticsFixtures();
      expect(states.absent.rows).toEqual([]);
      expect(states.zero.rows[0][3]).toBe('0');
      expect(states.nullText.rows[0][3]).toBe('null');
      expect(states.malformed.metaData).toEqual({});
    });
    it.todo('distinguishes absent, explicit zero and null observations');
    it.todo('leaves ordinary area unstacked');
    it.todo('uses the DHIS2 series axis field for secondary axes');
    it.todo('rejects malformed analytics with actionable validation');
  });
});
