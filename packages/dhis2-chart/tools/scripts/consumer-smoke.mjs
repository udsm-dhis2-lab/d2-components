import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const builtPackage = join(workspace, 'dist/packages/dhis2-chart');
const temporary = mkdtempSync(join(tmpdir(), 'd2-chart-consumer-'));
const consumer = join(temporary, 'consumer');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
  mkdirSync(consumer, { recursive: true });
  const [{ filename }] = JSON.parse(
    execFileSync(npm, ['pack', '--json', '--pack-destination', temporary], {
      cwd: builtPackage,
      encoding: 'utf8',
    })
  );
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'chart-only-consumer',
      private: true,
      type: 'commonjs',
    })
  );
  execFileSync(
    npm,
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--legacy-peer-deps',
      join(temporary, filename),
    ],
    { cwd: consumer, stdio: 'inherit' }
  );
  mkdirSync(join(consumer, 'node_modules'), { recursive: true });
  symlinkSync(
    join(workspace, 'node_modules/highcharts'),
    join(consumer, 'node_modules/highcharts'),
    'junction'
  );

  const manifest = JSON.parse(
    readFileSync(
      join(consumer, 'node_modules/@iapps/d2-charts/package.json'),
      'utf8'
    )
  );
  if (
    manifest.dependencies?.['mapbox-gl'] ||
    manifest.dependencies?.['@turf/turf']
  ) {
    throw new Error('Chart package pulled an unrelated visualization engine');
  }
  writeFileSync(
    join(consumer, 'verify.cjs'),
    [
      "const Module = require('node:module');",
      'const load = Module._load;',
      "const highcharts = { chart() { return { destroy() {}, exportChart() {}, getCSV() { return ''; } }; } };",
      'Module._load = function(request, parent, main) {',
      " if (request === 'highcharts') return highcharts;",
      " if (request.startsWith('highcharts/')) return () => {};",
      ' return load.call(this, request, parent, main);',
      '};',
      "const chart = require('@iapps/d2-charts');",
      "if (typeof chart.D2Charts !== 'function') throw new Error('D2Charts missing');",
      "if (typeof chart.YearOverYearDataService !== 'function') throw new Error('YearOverYearDataService missing');",
      "if (typeof chart.buildStandardChartOptions !== 'function') throw new Error('pure transform missing');",
      "console.log('Chart-only consumer import passed');",
    ].join('\n')
  );
  execFileSync(process.execPath, ['verify.cjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
