import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, '../../../..');
const budgets = JSON.parse(readFileSync(resolve(here, '../chart-bundle-budgets.json'), 'utf8'));
const entries = {
  model: 'packages/dhis2-chart/src/model.ts',
  extensions: 'packages/dhis2-chart/src/extensions.ts',
  runtimeWithoutHighcharts: 'packages/dhis2-chart/src/index.ts',
};
for (const [name, entry] of Object.entries(entries)) {
  const result = buildSync({ entryPoints: [resolve(workspace, entry)], bundle: true,
    write: false, minify: true, platform: 'browser', format: 'esm', metafile: true,
    external: ['highcharts', 'highcharts/*'] });
  const bytes = result.outputFiles[0].contents.length;
  assert.ok(bytes <= budgets[name], `${name} exceeded budget: ${bytes}/${budgets[name]}`);
  if (name !== 'runtimeWithoutHighcharts') {
    assert.ok(!Object.keys(result.metafile.inputs).some(path => path.includes('highcharts')),
      `${name} unexpectedly imports Highcharts`);
  }
  console.log(`PASS ${name}: ${bytes}/${budgets[name]} bytes`);
}
for (const [module, budget] of Object.entries(budgets.optionalModules)) {
  const file = module === 'highcharts-more' ? 'highcharts-more.js' : `modules/${module}.js`;
  const result = buildSync({ entryPoints: [resolve(workspace, 'node_modules/highcharts', file)],
    bundle: true, write: false, minify: true, platform: 'browser', format: 'iife',
    external: ['highcharts'] });
  const bytes = result.outputFiles[0].contents.length;
  assert.ok(bytes <= budget, `${module} exceeded budget: ${bytes}/${budget}`);
  console.log(`PASS ${module}: ${bytes}/${budget} bytes`);
}

const require = createRequire(import.meta.url);
const Module = require('node:module');
const load = Module._load;
const eager = [];
try {
  Module._load = function(request, parent, main) {
    if (request.startsWith('highcharts/modules/') || request === 'highcharts/highcharts-more') eager.push(request);
    return load.call(this, request, parent, main);
  };
  require(resolve(workspace, 'dist/packages/dhis2-chart/src/index.js'));
} finally {
  Module._load = load;
}
assert.deepEqual(eager, [], `Root import eagerly loaded optional modules: ${eager.join(', ')}`);
console.log('PASS root import: optional Highcharts modules remain unloaded');
