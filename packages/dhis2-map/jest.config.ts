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
    '^maplibre-gl$': '<rootDir>/src/testing/maplibre-gl.mock.ts',
  },
};
