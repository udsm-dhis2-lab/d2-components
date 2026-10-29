import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { normalizeAnalyticalData, buildStandardChartModel } = require('../../../dist/packages/dhis2-chart/src/index.js');

const raw = {
  headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'value' }],
  rows: [['visits', '2026Q1', '0']],
  metaData: { dimensions: { dx: ['visits'], pe: ['2026Q1'] },
    names: { visits: 'Visits', '2026Q1': 'January - March 2026' } },
};
const dataset = normalizeAnalyticalData(raw);
const model = buildStandardChartModel(dataset, {
  type: 'COLUMN', xAxisType: ['pe'], yAxisType: 'dx', zAxisType: [],
});
if (model.kind !== 'CHART_MODEL' || model.series.length !== 1) throw new Error('Normalized chart example failed');
console.log('Normalized chart example passed');
