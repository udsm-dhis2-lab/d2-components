import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  existsSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const packageRoot = join(workspaceRoot, 'dist/packages/dhis2-visualizer');
const temporaryRoot = mkdtempSync(join(tmpdir(), 'd2-visualizer-consumer-'));
const consumerRoot = join(temporaryRoot, 'consumer');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const peerPackages = new Map([
  ['@dhis2/ui', join(workspaceRoot, 'node_modules/@dhis2/ui')],
  ['@iapps/d2-web-sdk', join(workspaceRoot, 'dist/packages/dhis2-web-sdk')],
  [
    '@iapps/function-analytics',
    join(workspaceRoot, 'dist/packages/dhis2-analytics'),
  ],
  ['highcharts', join(workspaceRoot, 'node_modules/highcharts')],
  ['mapbox-gl', join(workspaceRoot, 'node_modules/mapbox-gl')],
  [
    'mapbox-gl-style-switcher',
    join(workspaceRoot, 'node_modules/mapbox-gl-style-switcher'),
  ],
  ['react', join(workspaceRoot, 'node_modules/react')],
]);

function runNpm(args, cwd) {
  execFileSync(npmCommand, args, {
    cwd,
    env: { ...process.env, npm_config_update_notifier: 'false' },
    stdio: 'inherit',
  });
}

function linkPeer(packageName, source) {
  const destination = join(consumerRoot, 'node_modules', packageName);
  if (existsSync(destination)) return;
  mkdirSync(dirname(destination), { recursive: true });
  symlinkSync(source, destination, 'junction');
}

try {
  mkdirSync(consumerRoot, { recursive: true });
  const packOutput = execFileSync(
    npmCommand,
    ['pack', '--json', '--pack-destination', temporaryRoot],
    { cwd: packageRoot, encoding: 'utf8' }
  );
  const [{ filename }] = JSON.parse(packOutput);
  const tarball = join(temporaryRoot, filename);

  writeFileSync(
    join(consumerRoot, 'package.json'),
    JSON.stringify(
      { name: 'd2-visualizer-smoke-consumer', private: true, type: 'commonjs' },
      null,
      2
    )
  );

  runNpm(
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--legacy-peer-deps',
      tarball,
    ],
    consumerRoot
  );

  peerPackages.forEach((source, packageName) => linkPeer(packageName, source));

  const packageJson = JSON.parse(
    readFileSync(
      join(consumerRoot, 'node_modules/@iapps/d2-visualizer/package.json'),
      'utf8'
    )
  );
  if (
    !packageJson.dependencies?.lodash ||
    !packageJson.peerDependencies?.highcharts
  ) {
    throw new Error('Packed manifest did not preserve dependency declarations');
  }

  writeFileSync(
    join(consumerRoot, 'verify.cjs'),
    [
      "const Module = require('node:module');",
      'const originalLoad = Module._load;',
      'const highchartsMock = { chart() {}, mapChart() {}, setOptions() {}, getOptions() { return { colors: [] }; } };',
      'const highchartsModuleMock = () => {};',
      'Module._load = function(request, parent, isMain) {',
      "  if (request === 'highcharts') return highchartsMock;",
      "  if (request.startsWith('highcharts/')) return highchartsModuleMock;",
      "  if (request === 'mapbox-gl') return {};",
      "  if (request === '@dhis2/ui') return new Proxy({}, { get: () => function Icon() {} });",
      '  return originalLoad.call(this, request, parent, isMain);',
      '};',
      "const visualizer = require('@iapps/d2-visualizer');",
      "if (typeof visualizer.D2Visualizer !== 'function') throw new Error('D2Visualizer export missing');",
      "if (!Array.isArray(visualizer.VISUALIZATION_TYPES)) throw new Error('VISUALIZATION_TYPES export missing');",
      "console.log('Packed consumer import passed');",
    ].join('\n')
  );

  execFileSync(process.execPath, ['verify.cjs'], {
    cwd: consumerRoot,
    stdio: 'inherit',
  });
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
