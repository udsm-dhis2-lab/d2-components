import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const workspace = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const { buildStandardChartOptions, buildYearOverYearChartModel, HighchartsOptionsAdapter } = require(resolve(workspace, 'dist/packages/dhis2-chart'));
const highchartsScript = resolve(workspace, 'node_modules/highcharts/highcharts.js');
const accessibilityScript = resolve(workspace, 'node_modules/highcharts/modules/accessibility.js');
const nativeChartBundle = buildSync({
  entryPoints: [resolve(workspace, 'packages/dhis2-chart/src/lib/standard-chart.transform.ts')],
  bundle: true, write: false, format: 'iife', globalName: 'D2ChartModel', platform: 'browser',
}).outputFiles[0].text;
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
  await page.addScriptTag({ path: resolve(workspace, 'node_modules/highcharts/modules/exporting.js') });
  await page.addScriptTag({ path: resolve(workspace, 'node_modules/highcharts/modules/offline-exporting.js') });
  await page.addScriptTag({ path: resolve(workspace, 'node_modules/highcharts/modules/export-data.js') });
  await page.addScriptTag({ content: nativeChartBundle });
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
  const inferredAxes = buildStandardChartOptions(analytics, {
    ...base, axes: [],
  });
  const inferredResult = await page.evaluate(options => {
    window.__chart?.destroy();
    window.__chart = window.Highcharts.chart('chart', options);
    const before = window.__chart.getSVG();
    window.__chart.setSize(520, 360, false);
    return {
      axes: window.__chart.yAxis.length,
      opposite: window.__chart.yAxis.map(axis => axis.opposite),
      kinds: window.__chart.series.map(series => series.type),
      indexes: window.__chart.series.map(series => series.yAxis.index),
      svgBefore: before, svgAfter: window.__chart.getSVG(),
      csv: window.__chart.getCSV(),
      aria: [...document.querySelectorAll('#chart [aria-label]')].map(node => node.getAttribute('aria-label')).join(' '),
    };
  }, inferredAxes);
  assert.equal(inferredResult.axes, 2, 'inferred multi-axis: missing numeric axis');
  assert.deepEqual(inferredResult.opposite, [false, true], 'inferred multi-axis: side order changed');
  assert.deepEqual(inferredResult.kinds, ['column', 'line'], 'inferred multi-axis: mixed types changed');
  assert.deepEqual(inferredResult.indexes, [0, 1], 'inferred multi-axis: series axis changed');
  assert.ok(inferredResult.svgBefore.includes('Coverage') && inferredResult.svgAfter.includes('Coverage'), 'inferred multi-axis: resize lost labels');
  assert.ok(inferredResult.csv.includes('Coverage') && inferredResult.aria.includes('Coverage'), 'inferred multi-axis: export or accessibility lost series');
  assert.ok((await page.locator('#chart').screenshot()).length > 1000, 'inferred multi-axis: screen rendering absent');
  const yoyBundle = {
    axis: { categories: ['W01', 'W02', 'W53'] },
    series: [
      { name: '2023', year: 2023, data: [0, 5, 9] },
      { name: '2024', year: 2024, data: [7, null, null] },
    ],
  };
  for (const [name, type] of [
    ['YOY line', 'YEAR_OVER_YEAR_LINE'],
    ['YOY column', 'YEAR_OVER_YEAR_COLUMN'],
  ]) {
    const model = buildYearOverYearChartModel(yoyBundle, { config: { displayName: name } }, type);
    const options = new HighchartsOptionsAdapter().toOptions(model);
    await page.evaluate(chartOptions => {
      window.__chart?.destroy();
      window.__chart = window.Highcharts.chart('chart', chartOptions);
    }, options);
    assert.ok(await page.locator('#chart svg').count(), `${name}: SVG not rendered`);
    assert.equal(await page.locator('#chart .highcharts-series').count(), 2, `${name}: series missing`);
    assert.ok((await page.locator('#chart').screenshot()).length > 1000, `${name}: screenshot empty`);
    assert.ok(await page.locator('#chart [aria-label]').count(), `${name}: accessibility labels absent`);
  }
  const multi = {
    headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'ou' }, { name: 'value' }],
    rows: [
      ['cases', 'jan', 'a', '3'], ['cases', 'feb', 'a', '5'],
      ['cases', 'jan', 'b', '7'],
    ],
    metaData: {
      dimensions: { dx: ['cases'], pe: ['jan', 'feb'], ou: ['a', 'b'] },
      dx: ['cases'], pe: ['jan', 'feb'], ou: ['a', 'b'],
      names: { cases: 'Cases', jan: 'Januari ndefu', feb: 'Februari ndefu', a: 'Kituo A', b: 'Kituo B' },
    },
  };
  for (const type of ['column', 'bar']) {
    const outcome = await page.evaluate(({ analytics, type }) => {
      window.__chart?.destroy();
      const options = window.D2ChartModel.buildStandardChartOptions(analytics, {
        type, xAxisType: ['pe', 'ou'], yAxisType: 'dx', axes: [], zAxisType: [], sortOrder: 0,
      });
      window.__chart = window.Highcharts.chart('chart', options);
      const first = window.__chart.getSVG();
      window.__chart.setSize(520, 360, false);
      const resized = window.__chart.getSVG();
      return {
        axisCount: window.__chart.xAxis.length,
        categories: window.__chart.xAxis[0].categories,
        groupsBefore: ['Januari ndefu', 'Februari ndefu'].every(label => first.includes(label)),
        groupsAfter: ['Januari ndefu', 'Februari ndefu'].every(label => resized.includes(label)),
        leavesAfter: ['Kituo A', 'Kituo B'].every(label => resized.includes(label)),
        upperGroups: window.__chart.xAxis[1].opposite && window.__chart.xAxis[1].tickPositions.length === 2,
        noPointers: window.__chart.xAxis.every(axis => axis.options.tickLength === 0),
        labelStyle: window.__chart.xAxis.every(axis => axis.options.labels.style.fontSize === '11px' && axis.options.labels.style.color === '#404b5a')
          && window.__chart.xAxis[1].options.labels.rotation === 0
          && window.__chart.xAxis[1].options.labels.style.whiteSpace === 'normal',
        separatorsBefore: (first.match(/highcharts-plot-line/g) || []).length,
        separatorsAfter: (resized.match(/highcharts-plot-line/g) || []).length,
        csv: window.__chart.getCSV(),
        svg: resized,
        aria: [...document.querySelectorAll('#chart [aria-label]')].map(node => node.getAttribute('aria-label')).join(' '),
      };
    }, { analytics: multi, type });
    assert.equal(outcome.axisCount, 2, `${type}: linked parent axis absent`);
    assert.ok(outcome.groupsBefore && outcome.groupsAfter && outcome.leavesAfter, `${type}: labels absent after resize/export`);
    assert.ok(outcome.upperGroups && outcome.noPointers, `${type}: group placement or axis pointers incorrect`);
    assert.ok(outcome.labelStyle, `${type}: category label size, alignment or wrapping incorrect`);
    assert.ok(outcome.separatorsBefore > 0 && outcome.separatorsAfter > 0, `${type}: group separators absent after resize/export`);
    assert.ok(outcome.categories.every(category => category.includes('Kituo')), `${type}: full export keys absent`);
    assert.ok(outcome.csv.includes('Kituo A') && outcome.csv.includes('Januari ndefu'), `${type}: CSV lost a level`);
    assert.ok(outcome.svg.includes('Kituo A') && outcome.svg.includes('Januari ndefu'), `${type}: SVG lost a level`);
    assert.ok(outcome.aria.includes('Kituo A') && outcome.aria.includes('Januari ndefu'), `${type}: screen reader labels lost a level`);
    assert.ok(await page.locator('#chart [aria-label]').count(), `${type}: ARIA labels absent`);
    assert.ok((await page.locator('#chart').screenshot()).length > 1000, `${type}: screen rendering absent`);
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.evaluate(() => window.__chart.exportChartLocal({ type: 'image/png', fallbackToExportServer: false }));
    const download = await downloadPromise;
    const png = readFileSync(await download.path());
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${type}: PNG export invalid`);
  }
  const scatter = {
    headers: [{ name: 'ou' }, { name: 'dx' }, { name: 'pe' }, { name: 'value' }],
    rows: [
      ['a', 'x', '2024', '1'], ['a', 'y', '2024', '2'],
      ['b', 'x', '2024', '2'], ['b', 'y', '2024', '4'],
      ['c', 'x', '2024', '3'], ['c', 'y', '2024', '6'],
      ['d', 'x', '2024', '4'], ['d', 'y', '2024', '8'],
    ],
    metaData: { dimensions: { ou: ['a', 'b', 'c', 'd'], dx: ['x', 'y'], pe: ['2024'] }, names: { a: 'Alpha', b: 'Beta', c: 'Gamma', d: 'Delta', x: 'X measure', y: 'Y measure' } },
  };
  const scatterResult = await page.evaluate(analytics => {
    window.__chart?.destroy();
    const options = window.D2ChartModel.buildStandardChartOptions(analytics, {
      type: 'SCATTER', renderId: 'chart', xMeasureId: 'x', yMeasureId: 'y', regressionType: 'LINEAR',
      outlierAnalysis: { enabled: true, outlierMethod: 'IQR' },
    });
    window.__chart = window.Highcharts.chart('chart', options);
    window.__chart.setSize(520, 360, false);
    return {
      points: window.__chart.series[0].points.length,
      series: window.__chart.series.length,
      svg: window.__chart.getSVG(),
      csv: window.__chart.getCSV(),
      aria: [...document.querySelectorAll('#chart [aria-label]')].map(node => node.getAttribute('aria-label')).join(' '),
    };
  }, scatter);
  assert.equal(scatterResult.points, 4, 'scatter: entity pairs lost');
  assert.equal(scatterResult.series, 3, 'scatter: base/regression/outlier serialization wrong');
  assert.ok(scatterResult.svg.includes('Alpha') && scatterResult.svg.includes('X measure'), 'scatter: SVG labels absent');
  assert.ok(scatterResult.csv.includes('Alpha') && scatterResult.aria.includes('Alpha'), 'scatter: export or accessibility names absent');
  assert.ok((await page.locator('#chart').screenshot()).length > 1000, 'scatter: screen rendering absent');
  console.log('Visual and accessibility browser smoke passed');
} finally {
  await browser.close();
}
