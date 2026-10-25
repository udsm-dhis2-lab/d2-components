import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><div id="chart"></div>',{url:'https://example.test'});
globalThis.window=dom.window;
globalThis.document=dom.window.document;
globalThis.Element=dom.window.Element;
globalThis.HTMLElement=dom.window.HTMLElement;
globalThis.Event=dom.window.Event;
globalThis.CustomEvent=dom.window.CustomEvent;
globalThis.localStorage=dom.window.localStorage;
const originalLoad=require('node:module')._load;
const distRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../../../dist/packages');
const builtPackages=new Map([
  ['@iapps/d2-charts','dhis2-chart'],
  ['@iapps/d2-maps','dhis2-map'],
  ['@iapps/d2-pivots','dhis2-pivot'],
  ['@iapps/d2-kpi-card','dhis2-kpi-card'],
  ['@iapps/d2-kpi-cards','dhis2-kpi-card'],
  ['@iapps/d2-custom-visualization','dhis2-custom-visualization'],
  ['@iapps/d2-custom-visualizations','dhis2-custom-visualization'],
]);
require('node:module')._load=function(request,parent,isMain){
  if(request==='@iapps/function-analytics')return {Fn:{Analytics:class{}}};
  if(request==='@iapps/d2-web-sdk')return {};
  const project=builtPackages.get(request);
  return originalLoad.call(this,project?resolve(distRoot,project):request,parent,isMain);
};
const {D2Visualizer,validateVisualizationRequest}=require('../../../dist/packages/dhis2-visualizer');
const request=validateVisualizationRequest({type:'LINE',target:{id:'chart'},configuration:{},data:{headers:[],rows:[],metaData:{}}});
const visualizer=new D2Visualizer();
if(request.type!=='LINE')throw new Error('Unexpected request type');
await visualizer.dispose();
console.log('Facade example passed');
