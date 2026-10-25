import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const Module=require('node:module'),load=Module._load;
Module._load=function(request,parent,main){if(request==='mapbox-gl')return {Map:class{},NavigationControl:class{},Marker:class{},Popup:class{}};if(request==='mapbox-gl-style-switcher')return {MapboxStyleSwitcherControl:class{}};return load.call(this,request,parent,main);};
const {D2Maps}=require('../../../dist/packages/dhis2-map');
const map=new D2Maps({createMap(){throw new Error('Example does not render')},createNavigationControl(){return{}},createStyleSwitcherControl(){return{}}});
map.dispose();
console.log('Map example passed');
