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
const temporary = mkdtempSync(join(tmpdir(), 'd2-map-consumer-'));
const consumer = join(temporary, 'consumer');
try {
  mkdirSync(consumer, { recursive: true });
  const [{ filename }] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', temporary], {
      cwd: join(workspace, 'dist/packages/dhis2-map'),
      encoding: 'utf8',
    })
  );
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'map-only-consumer',
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
      '--legacy-peer-deps',
      join(temporary, filename),
    ],
    { cwd: consumer, stdio: 'inherit' }
  );
  const manifest = JSON.parse(
    readFileSync(
      join(consumer, 'node_modules/@iapps/d2-maps/package.json'),
      'utf8'
    )
  );
  if (manifest.dependencies?.highcharts)
    throw new Error('Map package pulled Highcharts');
  writeFileSync(
    join(consumer, 'verify.cjs'),
    [
      "const Module=require('node:module'); const load=Module._load;",
      "Module._load=function(request,parent,main){ if(request==='mapbox-gl') return {Map:class{},NavigationControl:class{}}; if(request==='mapbox-gl-style-switcher') return {MapboxStyleSwitcherControl:class{}}; return load.call(this,request,parent,main); };",
      "const m=require('@iapps/d2-maps');",
      "const provider={createMap(){throw new Error('draw should not run')},createNavigationControl(){return{}},createStyleSwitcherControl(){return{}}};",
      "const renderer=new m.D2Maps(provider).setProviderConfig({style:'mock://style',accessToken:'test-only'});",
      "if(m.MapVisualizer!==m.D2Maps||typeof m.MapLayer!=='function'||typeof m.TrackedEntityLayer!=='function'||typeof m.FetchMapDataSource!=='function'||!renderer) throw new Error('map exports missing');",
      "console.log('Map-only consumer import passed');",
    ].join('\n')
  );
  execFileSync(process.execPath, ['verify.cjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
