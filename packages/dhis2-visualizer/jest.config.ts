module.exports = {
  displayName: 'dhis2-visualizer',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/dhis2-visualizer',
  coveragePathIgnorePatterns: [
    '/packages/dhis2-chart/',
    '/packages/dhis2-kpi-card/',
    '/packages/dhis2-pivot/',
  ],
  collectCoverageFrom: [
    'src/lib/d2-visualizer.ts',
    'src/lib/modules/chart/**/*.ts',
    'src/lib/modules/custom/**/*.ts',
    'src/lib/modules/map/**/*.ts',
    'src/lib/modules/single-value/**/*.ts',
    'src/lib/modules/table/**/*.ts',
    'src/lib/modules/year-over-year-line/**/*.ts',
    'src/lib/shared/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 22,
      functions: 32,
      lines: 35,
    },
  },
  moduleNameMapper: {
    '^highcharts$': '<rootDir>/src/testing/mocks/highcharts.mock.ts',
    '^highcharts/(highcharts-more|modules/.+)$':
      '<rootDir>/src/testing/mocks/engine-initializer.mock.ts',
    '^mapbox-gl$': '<rootDir>/src/testing/mocks/mapbox-gl.mock.ts',
    '^mapbox-gl-controls$':
      '<rootDir>/src/testing/mocks/mapbox-controls.mock.ts',
    '^mapbox-gl-style-switcher$':
      '<rootDir>/src/testing/mocks/mapbox-style-switcher.mock.ts',
    '^@turf/turf$': '<rootDir>/src/testing/mocks/turf.mock.ts',
  },
};
