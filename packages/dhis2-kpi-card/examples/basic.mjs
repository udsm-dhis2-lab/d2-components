import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {SingleValueVisualizer}=require('../../../dist/packages/dhis2-kpi-card');
const card=new SingleValueVisualizer();
card.dispose();
console.log('KPI example passed');
