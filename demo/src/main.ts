import { provideZoneChangeDetection } from "@angular/core";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import * as maplibregl from 'maplibre-gl';

// Keep the MapLibre worker on this app's origin, including under strict CSP.
maplibregl.setWorkerUrl(new URL('assets/maplibre-gl-csp-worker.js', document.baseURI).href);

platformBrowserDynamic()
  .bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
  .catch((err) => console.error(err));
