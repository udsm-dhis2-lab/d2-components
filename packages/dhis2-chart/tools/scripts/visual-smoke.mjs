import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const workspace = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const { buildStandardChartOptions } = require(resolve(workspace, 'dist/packages/dhis2-chart'));
const highchartsScript = resolve(workspace, 'node_modules/highcharts/highcharts.js');
const accessibilityScript = resolve(workspace, 'node_modules/highcharts/modules/accessibility.js');
const analytics = {
  headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'value' }],
  rows: [['cases', 'jan', '10'], ['coverage', 'jan', '80'], ['cases', 'feb', '12'], ['coverage', 'feb', '85']],
  metaData: {
    dimensions: { dx: ['cases', 'coverage'], pe: ['jan', 'feb'] },
    dx: ['cases', 'coverage'], pe: ['jan', 'feb'],
    names: { cases: 'Cases', coverage: 'Coverage', jan: 'January', feb: 'February' },
  },
};
const base = {
  type: 'column', xAxisType: ['pe'], yAxisType: 'dx', zAxisType: [],
  axes: [
    { type: 'DOMAIN', index: 0, title: { text: 'Month' } },
    { type: 'RANGE', index: 0, title: { text: 'Cases' } },
    { type: 'RANGE', index: 1, title: { text: 'Coverage' } },
  ],
  showData: true, sortOrder: 0,
  series: [
    { dimensionItem: 'cases', axis: 0, type: 'COLUMN' },
    { dimensionItem: 'coverage', axis: 1, type: 'LINE' },
  ],
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
  await page.setContent('<div id="chart" style="width:800px;height:400px"></div>');
  await page.addScriptTag({ path: highchartsScript });
  await page.addScriptTag({ path: accessibilityScript });
  for (const [name, config] of [
    ['mixed', base],
    ['stacked area', { ...base, type: 'stacked_area', series: undefined, percentStackedValues: true }],
  ]) {
    const options = buildStandardChartOptions(analytics, config);
    await page.evaluate((chartOptions) => {
      window.__chart?.destroy();
      window.__chart = window.Highcharts.chart('chart', chartOptions);
    }, options);
    assert.ok(await page.locator('#chart svg').count(), `${name}: SVG not rendered`);
    assert.ok(await page.locator('#chart .highcharts-series').count() >= 2, `${name}: series absent`);
    assert.ok((await page.locator('#chart').screenshot()).length > 1000, `${name}: screenshot empty`);
    assert.ok(await page.locator('#chart [aria-label]').count(), `${name}: accessibility labels absent`);
  }
  console.log('Visual and accessibility browser smoke passed');
} finally {
  await browser.close();
}
