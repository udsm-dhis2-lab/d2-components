import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../..');
for(const project of ['dhis2-visualizer','dhis2-chart','dhis2-map','dhis2-pivot','dhis2-kpi-card','dhis2-custom-visualization'])execFileSync(process.execPath,[resolve(root,'packages',project,'examples/basic.mjs')],{cwd:root,stdio:'inherit'});
