import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../..');
const packageRoot = resolve(root, 'dist/packages/dhis2-chart');
const manifest = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));
assert.deepEqual(Object.keys(manifest.exports).sort(), ['.', './extensions', './model', './package.json'].sort());
for (const entry of ['index', 'model', 'extensions']) {
  const declaration = readFileSync(resolve(packageRoot, 'src', `${entry}.d.ts`), 'utf8');
  assert.ok(declaration.length > 0, `${entry} declaration is empty`);
  assert.ok(!/scatter-chart\.model|chart\/helpers|validateChartCapabilities/.test(declaration),
    `${entry} declaration exposes an implementation detail`);
}
const runtime = readFileSync(resolve(packageRoot, 'src/index.d.ts'), 'utf8');
const extensions = readFileSync(resolve(packageRoot, 'src/extensions.d.ts'), 'utf8');
for (const name of ['D2Charts', 'ChartVisualizer', 'buildStandardChartModel'])
  assert.ok(runtime.includes(name), `Missing compatibility export ${name}`);
for (const name of ['ChartDefinitionRegistry', 'defineChart', 'ChartBuildContext'])
  assert.ok(extensions.includes(name), `Missing extension contract ${name}`);
console.log('Public declaration and export-map check passed');
