import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {D2Charts}=require('../../../dist/packages/dhis2-chart');
const chart=new D2Charts({create(){throw new Error('Example does not render')}});
chart.dispose();
console.log('Chart example passed');
