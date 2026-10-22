import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../..'
);
const temporary = mkdtempSync(join(tmpdir(), 'd2-pivot-consumer-'));
const consumer = join(temporary, 'consumer');
try {
  mkdirSync(consumer, { recursive: true });
  const [{ filename }] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', temporary], {
      cwd: join(workspace, 'dist/packages/dhis2-pivot'),
      encoding: 'utf8',
    })
  );
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'pivot-only-consumer',
      private: true,
      type: 'commonjs',
    })
  );
  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      join(temporary, filename),
    ],
    { cwd: consumer, stdio: 'inherit' }
  );
  const manifest = JSON.parse(
    readFileSync(
      join(consumer, 'node_modules/@iapps/d2-pivots/package.json'),
      'utf8'
    )
  );
  for (const dependency of ['highcharts', 'mapbox-gl', '@turf/turf'])
    if (
      manifest.dependencies?.[dependency] ||
      manifest.peerDependencies?.[dependency]
    )
      throw new Error(`Unexpected ${dependency} dependency`);
  writeFileSync(
    join(consumer, 'verify.cjs'),
    "const m=require('@iapps/d2-pivots'); if(typeof m.TableUtil!=='function'||typeof m.D2TableEngine!=='function'||typeof m.tableToCsv!=='function') throw new Error('pivot exports missing'); console.log('Pivot-only consumer import passed');"
  );
  execFileSync(process.execPath, ['verify.cjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
