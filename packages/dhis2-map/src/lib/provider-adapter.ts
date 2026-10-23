import * as mapboxgl from 'mapbox-gl';
import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';

export interface MapProviderConfig {
  style: string | Record<string, unknown>;
  accessToken?: string;
}
export interface ProviderControl {
  onAdd?(map: unknown): HTMLElement;
  onRemove?(): void;
}
export interface ProviderMap {
  once(event: 'load', listener: () => void): void;
  off(event: 'load', listener: () => void): void;
  addSource(id: string, source: unknown): void;
  addLayer(layer: unknown): void;
  addControl(control: ProviderControl, position?: string): void;
  removeControl?(control: ProviderControl): void;
  fitBounds(
    bounds: [number, number, number, number],
    options: { padding: number }
  ): void;
  remove(): void;
}
export interface MapProviderAdapter {
  createMap(options: Record<string, unknown>): ProviderMap;
  createNavigationControl(): ProviderControl;
  createStyleSwitcherControl(): ProviderControl;
}
export class DefaultMapProviderAdapter implements MapProviderAdapter {
  createMap(options: Record<string, unknown>): ProviderMap {
    return new mapboxgl.Map(
      options as mapboxgl.MapboxOptions
    ) as unknown as ProviderMap;
  }
  createNavigationControl(): ProviderControl {
    return new mapboxgl.NavigationControl();
  }
  createStyleSwitcherControl(): ProviderControl {
    return new MapboxStyleSwitcherControl();
  }
}
