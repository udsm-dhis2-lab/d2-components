import { chartAnalyticsFixture, chartConfigurationFixture } from './chart-characterization.fixtures';

/** Sanitized contract shapes based on DHIS2 visualizations kX8PQ5M5t2C and TFTNw7gToPb. */
const items = ['visit-1', 'visit-2', 'dropout', 'coverage-1', 'coverage-2', 'coverage-3', 'visit-3'];
const names: Record<string, string> = {
  'visit-1': 'First visits', 'visit-2': 'Second visits', 'visit-3': 'Third visits',
  dropout: 'Drop-out rate', 'coverage-1': 'First coverage',
  'coverage-2': 'Second coverage', 'coverage-3': 'Third coverage',
  '202401': 'January 2024', '202402': 'February 2024', 'ou-a': 'Facility A',
};

export function multiAxisAnalyticsFixture(dx: readonly string[] = items.slice(0, 5)) {
  const pe = ['202401', '202402'];
  const ou = ['ou-a'];
  const values = [
    ['visit-1', '202401', 'ou-a', '100'], ['visit-1', '202402', 'ou-a', '0'],
    ['visit-2', '202401', 'ou-a', '60'], ['visit-2', '202402', 'ou-a', '70'],
    ['dropout', '202401', 'ou-a', '40'], ['dropout', '202402', 'ou-a', '30'],
    ['coverage-1', '202401', 'ou-a', '80'], ['coverage-1', '202402', 'ou-a', '82'],
    ['coverage-2', '202401', 'ou-a', '55'], ['coverage-2', '202402', 'ou-a', '57'],
    ['coverage-3', '202401', 'ou-a', '25'], ['coverage-3', '202402', 'ou-a', '26'],
    ['visit-3', '202401', 'ou-a', '35'], ['visit-3', '202402', 'ou-a', '36'],
  ];
  const base = chartAnalyticsFixture();
  return { ...base,
    headers: [base.headers[3], base.headers[1], base.headers[0], base.headers[2]],
    rows: values.filter(([dimension]) => dx.includes(dimension))
      .map(([dimension, period, orgUnit, value]) => [value, period, dimension, orgUnit]),
    metaData: { dimensions: { dx: [...dx], pe, ou }, names, dx: [...dx], pe, ou },
  };
}

export function threeAxisConfigurationFixture() {
  return chartConfigurationFixture('column', {
    axes: [],
    series: [
      { dimensionItem: 'visit-1', axis: 0 },
      { dimensionItem: 'visit-2', axis: 0 },
      { dimensionItem: 'dropout', axis: 1 },
      { dimensionItem: 'coverage-1', axis: 2 },
      { dimensionItem: 'coverage-2', axis: 2 },
    ],
  });
}

export function mixedAxisConfigurationFixture() {
  return chartConfigurationFixture('column', {
    axes: [],
    series: [
      { dimensionItem: 'coverage-1', axis: 0 },
      { dimensionItem: 'coverage-2', axis: 0 },
      { dimensionItem: 'coverage-3', axis: 0 },
      { dimensionItem: 'visit-1', axis: 1, type: 'LINE' },
      { dimensionItem: 'visit-2', axis: 1, type: 'LINE' },
      { dimensionItem: 'visit-3', axis: 1, type: 'LINE' },
    ],
  });
}
