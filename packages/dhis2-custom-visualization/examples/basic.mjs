import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {CustomVisualizer}=require('../../../dist/packages/dhis2-custom-visualization');
const custom=new CustomVisualizer();
console.log(typeof custom.draw==='function'?'Custom example passed':'Custom example failed');
