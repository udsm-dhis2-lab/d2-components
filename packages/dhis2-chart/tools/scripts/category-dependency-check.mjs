import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const forbidden = ['highcharts', 'grouped', 'categories'].join('-');
const targets = [
  'package.json', 'package-lock.json', 'demo/src/index.d.ts',
  'dist/packages/dhis2-chart', 'dist/packages/dhis2-visualizer',
];
function inspect(path) {
  if (!existsSync(path)) return;
  const entries = readdirSync(path, { withFileTypes: true });
  for (const entry of entries) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) inspect(child);
    else if (/\.(?:js|d\.ts|json|mjs)$/.test(entry.name)) {
      assert.ok(!readFileSync(child, 'utf8').includes(forbidden), `${child} reintroduced the grouped-category plugin`);
    }
  }
}
for (const target of targets) {
  const path = resolve(workspace, target);
  if (!existsSync(path)) continue;
  if (target.endsWith('.json') || target.endsWith('.d.ts')) {
    assert.ok(!readFileSync(path, 'utf8').includes(forbidden), `${target} reintroduced the grouped-category plugin`);
  } else inspect(path);
}
console.log('No grouped-category plugin in manifests, declarations or built artifacts');
