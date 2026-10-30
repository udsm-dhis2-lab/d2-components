import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const Module = require('node:module');
const load = Module._load;
Module._load = function (request, parent, main) {
  if (request === 'maplibre-gl' || request === 'mapbox-gl' || request === '@turf/turf') {
    throw new Error(`Unrelated import loaded ${request}`);
  }
  if (request === 'highcharts') {
    return {
      chart() {
        return {
          destroy() {
            return undefined;
          },
          exportChart() {
            return undefined;
          },
          getCSV() {
            return '';
          },
        };
      },
    };
  }
  if (request.startsWith('highcharts/')) return () => undefined;
  return load.call(this, request, parent, main);
};

for (const entry of [
  'dist/packages/dhis2-chart/src/index.js',
  'dist/packages/dhis2-pivot/src/index.js',
  'dist/packages/dhis2-kpi-card/src/index.js',
])
  require(resolve(entry));

console.log('Unrelated module imports did not load MapLibre, Mapbox or Turf');
