export interface CharacterizationAnalytics {
  headers: Array<{ name: string; column: string; valueType: string }>;
  rows: string[][];
  metaData: {
    dimensions: Record<string, string[]>;
    names: Record<string, string>;
    dx: string[];
    pe: string[];
    ou: string[];
  };
}

export function chartAnalyticsFixture(
  overrides: Partial<CharacterizationAnalytics> = {}
): CharacterizationAnalytics {
  return {
    headers: [
      { name: 'dx', column: 'Data', valueType: 'TEXT' },
      { name: 'pe', column: 'Period', valueType: 'TEXT' },
      { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
      { name: 'value', column: 'Value', valueType: 'NUMBER' },
    ],
    rows: [
      ['dx-a', '202401', 'ou-a', '10'],
      ['dx-a', '202402', 'ou-a', '0'],
      ['dx-b', '202401', 'ou-a', '3.5'],
      ['dx-b', '202402', 'ou-a', '4.5'],
    ],
    metaData: {
      dimensions: {
        dx: ['dx-a', 'dx-b'],
        pe: ['202401', '202402'],
        ou: ['ou-a'],
      },
      names: {
        'dx-a': 'Cases',
        'dx-b': 'Coverage',
        '202401': 'January 2024',
        '202402': 'February 2024',
        'ou-a': 'Facility A',
      },
      dx: ['dx-a', 'dx-b'],
      pe: ['202401', '202402'],
      ou: ['ou-a'],
    },
    ...overrides,
  };
}

export function chartConfigurationFixture(
  type = 'column',
  overrides: Record<string, unknown> = {}
) {
  return {
    id: 'chart-fixture',
    renderId: 'chart-fixture',
    type,
    config: { type },
    title: 'Characterization chart',
    hideTitle: false,
    hideLegend: false,
    showData: true,
    noSpaceBetweenColumns: false,
    percentStackedValues: false,
    cumulativeValues: false,
    sortOrder: 0,
    xAxisType: ['pe'],
    yAxisType: ['dx'],
    seriesType: ['ou'],
    zAxisType: [],
    axes: [],
    seriesOptions: [],
    ...overrides,
  };
}

export function multidimensionalAnalyticsFixture(): CharacterizationAnalytics {
  return chartAnalyticsFixture({
    rows: [
      ['dx-a', '202401', 'ou-a', '10'],
      ['dx-a', '202402', 'ou-a', '12'],
      ['dx-a', '202401', 'ou-b', '20'],
      ['dx-a', '202402', 'ou-b', '22'],
    ],
    metaData: {
      dimensions: {
        dx: ['dx-a'],
        pe: ['202401', '202402'],
        ou: ['ou-a', 'ou-b'],
      },
      names: {
        'dx-a': 'Cases',
        '202401': 'January 2024',
        '202402': 'February 2024',
        'ou-a': 'Facility A',
        'ou-b': 'Facility B',
      },
      dx: ['dx-a'],
      pe: ['202401', '202402'],
      ou: ['ou-a', 'ou-b'],
    },
  });
}

export function valueStateAnalyticsFixtures() {
  return {
    absent: chartAnalyticsFixture({ rows: [] }),
    zero: chartAnalyticsFixture({
      rows: [['dx-a', '202401', 'ou-a', '0']],
    }),
    nullText: chartAnalyticsFixture({
      rows: [['dx-a', '202401', 'ou-a', 'null']],
    }),
    malformed: {
      headers: [],
      rows: [],
      metaData: {},
    },
  };
}

export const CURRENT_STANDARD_CHART_TYPES = [
  ['column', 'column'],
  ['line', 'line'],
  ['bar', 'bar'],
  ['dotted', 'line'],
  ['stacked_column', 'column'],
  ['stacked_bar', 'bar'],
  ['area', 'area'],
] as const;
