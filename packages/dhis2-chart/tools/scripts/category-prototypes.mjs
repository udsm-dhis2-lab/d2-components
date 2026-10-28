import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const engine = resolve(root, 'node_modules/highcharts');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 520 } });
  await page.setContent('<div id="chart" style="width:800px;height:400px"></div>');
  for (const script of ['highcharts.js', 'modules/exporting.js', 'modules/offline-exporting.js', 'modules/accessibility.js']) {
    await page.addScriptTag({ path: resolve(engine, script) });
  }
  const leaf = ['January', 'February', 'January', 'February'];
  const groups = [
    { name: 'Facility A', from: -0.5, to: 1.5, center: 0.5 },
    { name: 'Facility B', from: 1.5, to: 3.5, center: 2.5 },
  ];
  for (const design of ['plot-bands', 'linked-axis']) {
    for (const inverted of [false, true]) {
      const outcome = await page.evaluate(async ({ design, inverted, leaf, groups }) => {
        window.__chart?.destroy();
        const xAxis = design === 'plot-bands'
          ? { categories: leaf, plotBands: groups.map(group => ({ from: group.from, to: group.to, label: { text: group.name, verticalAlign: 'top' } })) }
          : [{ categories: leaf }, { linkedTo: 0, opposite: true, tickPositions: groups.map(group => group.center), labels: { formatter() { return groups.find(group => group.center === this.pos)?.name || ''; } } }];
        const chart = window.Highcharts.chart('chart', {
          chart: { type: inverted ? 'bar' : 'column', width: 800, height: 400 },
          title: { text: `${design} ${inverted}` },
          xAxis,
          series: [{ data: [1, 2, 3, 4], name: 'Cases' }],
        });
        window.__chart = chart;
        const before = chart.getSVG();
        chart.setSize(520, 360, false);
        const after = chart.getSVG();
        return {
          before: groups.map(group => before.includes(group.name)),
          after: groups.map(group => after.includes(group.name)),
          leaf: leaf.every(name => after.includes(name)),
          axisCount: chart.xAxis.length,
          svgLength: after.length,
        };
      }, { design, inverted, leaf, groups });
      assert.ok(outcome.svgLength > 1000 && outcome.leaf, `${design}/${inverted}: leaf labels missing`);
      assert.ok(outcome.before.every(Boolean) && outcome.after.every(Boolean), `${design}/${inverted}: group labels missing`);
      assert.ok((await page.locator('#chart').screenshot()).length > 1000);
      console.log(`${design}/${inverted ? 'inverted' : 'normal'}: ${JSON.stringify(outcome)}`);
    }
  }
} finally {
  await browser.close();
}
