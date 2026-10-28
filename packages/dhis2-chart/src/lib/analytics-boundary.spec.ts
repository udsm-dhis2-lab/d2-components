import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
} from '../testing/fixtures/chart-characterization.fixtures';
import { AnalyticalBoundaryError, AnalyticalDataset } from './analytical-dataset';
import { normalizeAnalyticalData, toLegacyAnalytics } from './analytics-boundary';
import { adaptLegacyChartConfiguration } from './legacy-chart-configuration';
import { buildStandardChartOptions } from './standard-chart.transform';

describe('analytical data boundary', () => {
  it('resolves reordered headers by name and ignores additional non-dimension columns', () => {
    const analytics = chartAnalyticsFixture();
    const ordered = normalizeAnalyticalData(analytics);
    const reordered = normalizeAnalyticalData({
      ...analytics,
      headers: [
        { name: 'source' },
        analytics.headers[3],
        analytics.headers[2],
        analytics.headers[0],
        analytics.headers[1],
      ],
      rows: analytics.rows.map(([dx, pe, ou, value]) => [
        'DHIS2', value, ou, dx, pe,
      ]),
    });

    expect(reordered.dimensions).toEqual(ordered.dimensions);
    expect(reordered.observations.map(({ coordinates, value }) => ({ coordinates, value })))
      .toEqual(ordered.observations.map(({ coordinates, value }) => ({ coordinates, value })));
    expect(reordered.observations[0].attributes).toEqual({ source: 'DHIS2' });
  });

  it('preserves absent, explicit null and numeric zero independently', () => {
    const analytics = chartAnalyticsFixture({
      rows: [
        ['dx-a', '202401', 'ou-a', '0'],
        ['dx-a', '202402', 'ou-a', 'null'],
      ],
    });
    const dataset = normalizeAnalyticalData(analytics);

    expect(dataset.observations[0].value).toEqual({ kind: 'number', value: 0, raw: '0' });
    expect(dataset.observations[1].value).toEqual({ kind: 'null', value: null, raw: 'null' });
    expect(dataset.observations.some((observation) => observation.coordinates['dx'] === 'dx-b'))
      .toBe(false);
  });

  it('derives flattened dimensions and names from item metadata', () => {
    const analytics = chartAnalyticsFixture();
    const dataset = normalizeAnalyticalData({
      ...analytics,
      metaData: {
        dx: ['dx-a', 'dx-b'],
        pe: ['202401', '202402'],
        ou: ['ou-a'],
        items: {
          'dx-a': { name: 'Cases' },
          'dx-b': { name: 'Coverage' },
          '202401': { name: 'January 2024' },
          '202402': { name: 'February 2024' },
          'ou-a': { name: 'Facility A' },
        },
      },
    });

    expect(dataset.dimensions.map(({ id }) => id)).toEqual(['dx', 'pe', 'ou']);
    expect(dataset.metadata.names['dx-a']).toBe('Cases');
    expect(toLegacyAnalytics(dataset).metaData).toMatchObject({
      dx: ['dx-a', 'dx-b'],
      names: { 'dx-a': 'Cases' },
    });
  });

  it('allows a filter dimension in metadata without a row header', () => {
    const analytics = chartAnalyticsFixture();
    const dataset = normalizeAnalyticalData({
      ...analytics,
      metaData: {
        ...analytics.metaData,
        dimensions: {
          ...analytics.metaData.dimensions,
          co: ['co-a'],
        },
      },
    });

    expect(dataset.dimensions.find(({ id }) => id === 'co')?.items[0].id)
      .toBe('co-a');
    expect(dataset.observations[0].coordinates['co']).toBeUndefined();
  });

  it('reports invalid headers and rows with stable paths and codes', () => {
    const analytics = chartAnalyticsFixture({
      rows: [['dx-a', '202401', 'ou-a', 'not-a-number'], ['dx-a']],
    });
    expect(() => normalizeAnalyticalData(analytics)).toThrow(AnalyticalBoundaryError);
    try {
      normalizeAnalyticalData(analytics);
    } catch (error) {
      expect((error as AnalyticalBoundaryError).issues).toEqual([
        expect.objectContaining({ path: 'rows[0][3]', code: 'INVALID_VALUE' }),
        expect.objectContaining({ path: 'rows[1]', code: 'ROW_WIDTH' }),
      ]);
    }
  });

  it('preserves unknown native response, metadata, item and config properties', () => {
    const analytics = {
      ...chartAnalyticsFixture(),
      customResponseFlag: { source: 'server' },
      metaData: {
        ...chartAnalyticsFixture().metaData,
        customMetadataFlag: true,
        items: { 'dx-a': { name: 'Cases', customItemFlag: 7 } },
      },
    };
    const config = chartConfigurationFixture('column', { customConfigFlag: 'retained' });
    const originalAnalytics = JSON.parse(JSON.stringify(analytics));
    const originalConfig = JSON.parse(JSON.stringify(config));

    const dataset = normalizeAnalyticalData(analytics);
    const roundTrip = toLegacyAnalytics(dataset);
    const adaptedConfig = adaptLegacyChartConfiguration(config);

    expect(dataset.native['customResponseFlag']).toEqual({ source: 'server' });
    expect(dataset.metadata.native['customMetadataFlag']).toBe(true);
    expect(dataset.dimensions[0].items[0].native?.['customItemFlag']).toBe(7);
    expect(roundTrip['customResponseFlag']).toEqual({ source: 'server' });
    expect((roundTrip['metaData'] as Record<string, unknown>)['customMetadataFlag']).toBe(true);
    expect(adaptedConfig.native['customConfigFlag']).toBe('retained');
    expect(analytics).toEqual(originalAnalytics);
    expect(config).toEqual(originalConfig);
  });

  it('keeps direct normalized and raw option outputs equivalent', () => {
    const analytics = chartAnalyticsFixture();
    const configuration = chartConfigurationFixture();
    const dataset: AnalyticalDataset = normalizeAnalyticalData(analytics);

    expect(buildStandardChartOptions(dataset, configuration))
      .toEqual(buildStandardChartOptions(analytics, configuration));
  });

  it('rejects malformed direct datasets before reaching the chart helper', () => {
    const malformed = { kind: 'ANALYTICAL_DATASET', observations: [] };
    expect(() => buildStandardChartOptions(malformed, chartConfigurationFixture()))
      .toThrow(AnalyticalBoundaryError);
  });

  it('validates legacy configuration without dropping unknown properties', () => {
    expect(() => adaptLegacyChartConfiguration({ type: 'column' })).toThrow(
      AnalyticalBoundaryError
    );
    const config = chartConfigurationFixture('column', { nativeExtension: { x: 1 } });
    expect(adaptLegacyChartConfiguration(config).native['nativeExtension'])
      .toEqual({ x: 1 });
  });
});
