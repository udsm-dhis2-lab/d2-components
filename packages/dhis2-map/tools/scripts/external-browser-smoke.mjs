import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const root = resolve(import.meta.dirname, '../../../..');
const browser = await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
try {
  const page = await browser.newPage({viewport:{width:800,height:600}});
  const tile = readFileSync(resolve(root,'demo/src/assets/images/cholera.png'));
  await page.route('https://maps.example.org/**', route=>route.fulfill({status:200,contentType:'image/png',body:tile}));
  await page.setContent('<div id="map" style="width:800px;height:600px"></div>');
  await page.addScriptTag({path:resolve(root,'node_modules/maplibre-gl/dist/maplibre-gl.js')});
  const result = await page.evaluate(async()=>{
    const map = new window.maplibregl.Map({container:'map',center:[0,0],zoom:1,
      style:{version:8,sources:{tiles:{type:'raster',tiles:['https://maps.example.org/{z}/{x}/{y}.png'],
        tileSize:256,attribution:'District source'}},layers:[{id:'approved-tiles',type:'raster',source:'tiles'}]}});
    map.addControl(new window.maplibregl.NavigationControl());
    await new Promise((resolve,reject)=>{map.once('load',()=>resolve());
      map.once('error',event=>reject(new Error(String(event.error?.message || event.type))));});
    const data = {layer:Boolean(map.getLayer('approved-tiles')),
      canvas:map.getCanvas().width > 0 && map.getCanvas().height > 0,
      accessibleZoom:!!document.querySelector('button[aria-label="Zoom in"]'),
      attribution:document.body.textContent.includes('District source')};
    map.remove();
    return data;
  });
  if (!Object.values(result).every(Boolean)) throw new Error(`MapLibre browser smoke failed: ${JSON.stringify(result)}`);
  console.log('MapLibre raster browser and accessibility smoke passed');
} finally { await browser.close(); }
