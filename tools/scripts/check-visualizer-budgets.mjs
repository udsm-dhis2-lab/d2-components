import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root=resolve(import.meta.dirname,'../..');
const budgets=JSON.parse(readFileSync(join(root,'tools/visualizer-bundle-budgets.json'),'utf8'));
function jsBytes(directory){return readdirSync(directory,{withFileTypes:true}).reduce((total,entry)=>{const path=join(directory,entry.name);return total+(entry.isDirectory()?jsBytes(path):entry.name.endsWith('.js')?statSync(path).size:0);},0);}
let failed=false;
for(const [project,budget] of Object.entries(budgets)){const directory=join(root,'dist/packages',project,'src');if(!existsSync(directory))throw new Error(`Build output missing for ${project}`);const actual=jsBytes(directory);const status=actual<=budget?'PASS':'FAIL';console.log(`${status} ${project}: ${actual}/${budget} bytes`);if(actual>budget)failed=true;}
if(failed)throw new Error('Visualizer JavaScript budget exceeded');
