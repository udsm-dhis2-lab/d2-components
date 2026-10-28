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
      "const registry = chart.createStandardChartRegistry();",
      "if (registry.resolve('COLUMN').family !== 'cartesian') throw new Error('registry missing');",
      "if (registry.resolve('STACKED_AREA').family !== 'cartesian') throw new Error('stacked area missing');",
      "if (!chart.chartCapability('COLUMN', 'axes')) throw new Error('capability query missing');",
      "try { registry.register(registry.resolve('COLUMN')); throw new Error('duplicate accepted'); } catch (error) { if (!String(error).includes('Duplicate chart definition')) throw error; }",
      "registry.register({ type: 'EXTERNAL', family: 'cartesian', build: context => registry.resolve('COLUMN').build({ ...context, configuration: { ...context.configuration, type: 'column', native: { ...context.configuration.native, type: 'column' } } }) });",
      "const external = new chart.D2Charts({ create() { return { destroy() {}, exportChart() {}, getCSV() { return ''; } }; } }, registry);",
      "if (typeof external.setType('EXTERNAL').draw !== 'function') throw new Error('extension facade missing');",
      "console.log('Chart-only consumer import passed');",
    ].join('\n')
  );
  execFileSync(process.execPath, ['verify.cjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
  writeFileSync(
    join(consumer, 'verify-model.cjs'),
    [
      "const Module = require('node:module');",
      'const load = Module._load;',
      'Module._load = function(request, parent, main) {',
      " if (request === 'highcharts' || request.startsWith('highcharts/')) throw new Error('Model entry loaded Highcharts');",
      ' return load.call(this, request, parent, main);',
      '};',
      "const { buildStandardChartModel } = require('@iapps/d2-charts/model');",
      "const raw = { headers: [{ name: 'dx' }, { name: 'value' }], rows: [['a', '0']], metaData: { dimensions: { dx: ['a'] }, dx: ['a'], names: { a: 'A' } } };",
      "const model = buildStandardChartModel(raw, { type: 'column', xAxisType: ['dx'], yAxisType: 'dx', axes: [], zAxisType: [] });",
      "if (model.kind !== 'CHART_MODEL') throw new Error('Model creation failed');",
      "console.log('Model-only consumer import passed');",
    ].join('\n')
  );
  execFileSync(process.execPath, ['verify-model.cjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
  writeFileSync(
    join(consumer, 'typecheck.ts'),
    [
      "import { D2Charts, ChartDefinitionRegistry, createStandardChartRegistry, chartCapability, chartCapabilities, normalizeAnalyticalData, buildStandardChartOptions, buildStandardChartModel, HighchartsOptionsAdapter, type ChartDefinition, type ChartModel, type AnalyticalDataset, type AnalyticalObservation, AnalyticalBoundaryError } from '@iapps/d2-charts';",
      "const raw = { headers: [{ name: 'dx' }, { name: 'value' }], rows: [['a', '0']], metaData: { dimensions: { dx: ['a'] }, names: { a: 'A' } } };",
      'const dataset: AnalyticalDataset = normalizeAnalyticalData(raw);',
      'const observation: AnalyticalObservation = dataset.observations[0];',
      "if (observation.value.kind === 'number') observation.value.value.toFixed(1);",
      'new D2Charts().setAnalyticalDataset(dataset);',
      "const registry: ChartDefinitionRegistry = createStandardChartRegistry();",
      "const extension: ChartDefinition<'EXTERNAL'> = { type: 'EXTERNAL', family: 'cartesian', build: context => registry.resolve('COLUMN').build(context) };",
      'registry.register(extension);',
      'new D2Charts(undefined, registry);',
      "new D2Charts(undefined, registry).setType('EXTERNAL');",
      "new D2Charts().setType('STACKED_AREA');",
      "const axesCapability = chartCapability('COLUMN', 'axes');",
      'void axesCapability; void chartCapabilities;',
      "buildStandardChartOptions(dataset, { type: 'column', xAxisType: ['dx'], yAxisType: 'dx', axes: [] });",
      "const model: ChartModel = buildStandardChartModel(dataset, { type: 'column', xAxisType: ['dx'], yAxisType: 'dx', axes: [] });",
      'new HighchartsOptionsAdapter().toOptions(model);',
      'void AnalyticalBoundaryError;',
    ].join('\n')
  );
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: 'Node16',
        moduleResolution: 'Node16',
        target: 'ES2020',
        skipLibCheck: false,
      },
      files: ['typecheck.ts'],
    })
  );
  execFileSync(
    process.execPath,
    [join(workspace, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'],
    { cwd: consumer, stdio: 'inherit' }
  );
  writeFileSync(
    join(consumer, 'typecheck-no-dom.ts'),
    [
      "import { buildStandardChartModel, type ChartModel, type ChartSeriesModel } from '@iapps/d2-charts/model';",
      "const raw = { headers: [{ name: 'dx' }, { name: 'value' }], rows: [['a', '0']], metaData: { dimensions: { dx: ['a'] }, dx: ['a'], names: { a: 'A' } } };",
      "const model: ChartModel = buildStandardChartModel(raw, { type: 'column', xAxisType: ['dx'], yAxisType: 'dx', axes: [], zAxisType: [] });",
      'const series: ChartSeriesModel | undefined = model.series[0];',
      'void series;',
    ].join('\n')
  );
  writeFileSync(
    join(consumer, 'tsconfig-no-dom.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: 'Node16',
        moduleResolution: 'Node16',
        target: 'ES2020',
        lib: ['ES2020'],
        types: [],
        skipLibCheck: false,
      },
      files: ['typecheck-no-dom.ts'],
    })
  );
  execFileSync(
    process.execPath,
    [
      join(workspace, 'node_modules/typescript/bin/tsc'),
      '-p',
      'tsconfig-no-dom.json',
    ],
    { cwd: consumer, stdio: 'inherit' }
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
