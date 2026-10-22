module.exports = {
  displayName: 'dhis2-chart',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/packages/dhis2-chart',
  moduleNameMapper: {
    '^highcharts$': '<rootDir>/src/testing/mocks/highcharts.mock.ts',
    '^highcharts/(highcharts-more|modules/.+)$':
      '<rootDir>/src/testing/mocks/engine-initializer.mock.ts',
  },
};
