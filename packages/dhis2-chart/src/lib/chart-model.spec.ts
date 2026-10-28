/** @jest-environment node */
import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
} from '../testing/fixtures/chart-characterization.fixtures';
import { buildStandardChartModel } from './standard-chart.transform';

describe('engine-neutral chart model (no DOM)', () => {
  it('creates categories, discriminated series, points and annotations without a browser', () => {
    expect(typeof document).toBe('undefined');
    const analytics = chartAnalyticsFixture();
    const before = JSON.stringify(analytics);
    const model = buildStandardChartModel(
      analytics,
      chartConfigurationFixture('column', {
        targetLineValue: 12,
        targetLineLabel: 'Target',
      })
    );
    expect(model.kind).toBe('CHART_MODEL');
    expect(model.categoryAxis?.categories).toEqual([
      'January 2024',
      'February 2024',
    ]);
    expect(model.series[0]).toMatchObject({
      kind: 'column',
      points: [{ value: 10 }, { value: 0 }],
    });
    expect(model.annotations[0]).toMatchObject({
      kind: 'reference-line',
      value: 12,
      label: 'Target',
    });
    expect(model.requiredModules).toEqual([
      'exporting',
      'offline-exporting',
      'export-data',
    ]);
    expect(JSON.stringify(analytics)).toBe(before);
  });

  it.each([
    ['radar', ['highcharts-more']],
    ['solidgauge', ['highcharts-more', 'solid-gauge']],
    ['gauge', ['highcharts-more', 'solid-gauge']],
    ['pie', ['drilldown']],
  ])('declares optional modules for %s', (type, expected) => {
    const model = buildStandardChartModel(
      chartAnalyticsFixture(),
      chartConfigurationFixture(type)
    );
    expect(model.requiredModules).toEqual(expect.arrayContaining(expected));
  });
});
