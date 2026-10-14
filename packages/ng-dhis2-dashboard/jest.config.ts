module.exports = {
  displayName: 'ng-dhis2-dashboard',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/packages/ng-dhis2-dashboard',
  collectCoverageFrom: [
    'src/lib/models/{dashboard,dashboard-item,dashboard-menu,global-selection}.model.ts',
    'src/lib/utilities/*.util.ts',
    'src/lib/services/{dashboard,dashboard-config,dashboard-item,dashboard-menu,tracker-dashboard}.service.ts',
    'src/lib/store/reducers/dashboard-selection.reducer.ts',
    '!src/lib/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 60,
      functions: 85,
      lines: 85,
    },
  },
  moduleNameMapper: {
    '^@dhis2/ui$': '<rootDir>/src/testing/mocks/dhis2-ui.mock.ts',
    '^@iapps/d2-visualizer$':
      '<rootDir>/src/testing/mocks/d2-visualizer.mock.ts',
    '^@iapps/ng-dhis2-ui$':
      '<rootDir>/src/testing/mocks/ng-dhis2-ui.mock.ts',
    '^@iapps/period-utilities$':
      '<rootDir>/src/testing/mocks/period-utilities.mock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
