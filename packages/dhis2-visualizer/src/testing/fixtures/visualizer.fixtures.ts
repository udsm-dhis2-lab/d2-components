export interface TestAnalytics {
  headers: Array<{ name: string; column: string; valueType: string }>;
  metaData: {
    dimensions: Record<string, string[]>;
    items: Record<string, { name: string }>;
    names: Record<string, string>;
    dx: string[];
    pe: string[];
    ou: string[];
  };
  rows: string[][];
}

export function analyticsFixture(
  overrides: Partial<TestAnalytics> = {}
): TestAnalytics {
  return {
    headers: [
      { name: 'dx', column: 'Data', valueType: 'TEXT' },
      { name: 'pe', column: 'Period', valueType: 'TEXT' },
      { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
      { name: 'value', column: 'Value', valueType: 'NUMBER' },
    ],
    metaData: {
      dimensions: { dx: ['dx-a'], pe: ['2024'], ou: ['ou-a'] },
      items: {
        'dx-a': { name: 'Coverage_indicator' },
        '2024': { name: '2024' },
        'ou-a': { name: 'Facility A' },
      },
      names: {
        'dx-a': 'Coverage_indicator',
        '2024': '2024',
        'ou-a': 'Facility A',
      },
      dx: ['dx-a'],
      pe: ['2024'],
      ou: ['ou-a'],
    },
    rows: [
      ['dx-a', '2024', 'ou-a', '40'],
      ['dx-a', '2024', 'ou-a', '2.5'],
    ],
    ...overrides,
  };
}

export function selectionsFixture() {
  return [
    { dimension: 'dx', items: [{ id: 'dx-a' }] },
    { dimension: 'pe', items: [{ id: '2024' }] },
    { dimension: 'ou', items: [{ id: 'ou-a' }] },
  ];
}

export function visualizationConfigFixture(
  type = 'COLUMN',
  overrides: Record<string, unknown> = {}
) {
  return {
    id: 'visualization-host',
    type,
    title: 'Characterized visualization',
    hideTitle: false,
    hideSubtitle: false,
    hideLegend: false,
    showData: true,
    showLabels: true,
    sortOrder: 0,
    cumulativeValues: false,
    percentStackedValues: false,
    rows: [{ dimension: 'dx', items: [{ id: 'dx-a' }] }],
    columns: [{ dimension: 'ou', items: [{ id: 'ou-a' }] }],
    filters: [{ dimension: 'pe', items: [{ id: '2024' }] }],
    ...overrides,
  };
}

export function geoJsonFixture() {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [35, -6] },
        properties: { id: 'ou-a', name: 'Facility A', value: 40 },
      },
    ],
  };
}

export function trackerFixture() {
  return [
    {
      trackedEntity: 'tei-a',
      orgUnit: 'ou-a',
      attributes: [{ attribute: 'tea-a', value: 'Example' }],
    },
  ];
}
