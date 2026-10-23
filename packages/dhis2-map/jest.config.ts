module.exports = {
  displayName: 'dhis2-map',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/packages/dhis2-map',
  moduleNameMapper: {
    '^mapbox-gl$': '<rootDir>/src/testing/mapbox-gl.mock.ts',
    '^mapbox-gl-style-switcher$':
      '<rootDir>/src/testing/style-switcher.mock.ts',
  },
};
