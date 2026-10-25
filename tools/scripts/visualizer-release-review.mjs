import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const projects=['dhis2-visualizer','dhis2-chart','dhis2-map','dhis2-pivot','dhis2-kpi-card','dhis2-custom-visualization'];
const failures=[];
for(const project of projects){const readme=join(root,'packages',project,'README.md');const text=readFileSync(readme,'utf8');for(const heading of ['Installation','Usage','Lifecycle','Errors','Security'])if(!text.includes(`## ${heading}`))failures.push(`${project} README lacks ${heading}`);const example=join(root,'packages',project,'examples','basic.mjs');if(!existsSync(example))failures.push(`${project} lacks runnable example`);}
const productionRoots=projects.map(project=>join(root,'packages',project,'src'));
function sourceFiles(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?sourceFiles(join(directory,entry.name)):entry.name.endsWith('.ts')&&!entry.name.endsWith('.spec.ts')?[join(directory,entry.name)]:[]);}
for(const file of productionRoots.flatMap(sourceFiles)){const source=readFileSync(file,'utf8');if(/Function\s*\(|\.innerHTML\s*=|\.setHTML\s*\(/.test(source))failures.push(`unsafe rendering/evaluation API in ${file}`);if(/pk\.[A-Za-z0-9_-]{20,}/.test(source))failures.push(`possible embedded provider credential in ${file}`);}
const facade=readFileSync(join(root,'packages/dhis2-visualizer/src/lib/d2-visualizer.ts'),'utf8');for(const method of ['setId','setType','setConfig','setSelections','setData'])if(!new RegExp(`@deprecated[^]*?${method}\\(`).test(facade))failures.push(`${method} compatibility API lacks deprecation guidance`);
if(failures.length)throw new Error(`Release review failed:\n- ${failures.join('\n- ')}`);
console.log('Release review passed: docs, examples, deprecated adapters, security boundary');
