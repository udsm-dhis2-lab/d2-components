import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
  CURRENT_STANDARD_CHART_TYPES,
} from '../testing/fixtures/chart-characterization.fixtures';
import { buildStandardChartOptions } from './standard-chart.transform';

// Sprint 10-compatible serialized options, captured before Sprint 12 extraction.
// These are refactor gates, not a statement that recorded defects are desired.
describe('Sprint 12 serialized option baseline', () => {
  it.each(CURRENT_STANDARD_CHART_TYPES)('%s', (type, _highchartsType) => {
    expect(
      buildStandardChartOptions(
        chartAnalyticsFixture(),
        chartConfigurationFixture(type)
      )
    ).toMatchSnapshot();
  });

  it('mixed axes and presentation', () => {
    expect(
      buildStandardChartOptions(
        chartAnalyticsFixture(),
        chartConfigurationFixture('column', {
          axes: [
            { type: 'DOMAIN', decimals: 0, title: { text: 'Period' } },
            { type: 'RANGE', decimals: 1, title: { text: 'Cases' } },
          ],
          seriesOptions: [{ dimensionItem: 'dx-b', type: 'line', axix: 1 }],
          targetLineValue: 50,
          targetLineLabel: 'Target',
          showData: true,
        })
      )
    ).toMatchSnapshot();
  });
});
