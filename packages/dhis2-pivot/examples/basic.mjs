import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {D2Pivots}=require('../../../dist/packages/dhis2-pivot');
const pivot=new D2Pivots();
pivot.dispose();
console.log('Pivot example passed');
