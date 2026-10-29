import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { buildStandardChartModel } = require('../../../dist/packages/dhis2-chart/src/index.js');
const { createStandardChartRegistry, defineChart } = require('../../../dist/packages/dhis2-chart/src/extensions.js');

const raw = {
  headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'value' }],
  rows: [['visits', '2026Q1', '3']],
  metaData: { dimensions: { dx: ['visits'], pe: ['2026Q1'] },
    names: { visits: 'Visits', '2026Q1': 'January - March 2026' } },
};
const registry = createStandardChartRegistry();
registry.register(defineChart({
  type: 'LOCAL_COLUMN', family: 'cartesian',
  build: ({ analytics }) => ({ ...buildStandardChartModel(analytics, {
    type: 'COLUMN', xAxisType: ['pe'], yAxisType: 'dx', zAxisType: [],
  }), visualType: 'local-column' }),
}));
const model = buildStandardChartModel(raw, {
  type: 'LOCAL_COLUMN', xAxisType: ['pe'], yAxisType: 'dx', zAxisType: [],
}, registry);
if (model.visualType !== 'local-column') throw new Error('Extension example failed');
console.log('Extension example passed');
