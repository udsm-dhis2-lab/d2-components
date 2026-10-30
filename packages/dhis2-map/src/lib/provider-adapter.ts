import * as maplibregl from 'maplibre-gl';

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
    const style = options['style'];
    if (typeof style === 'string' && style.startsWith('mapbox://'))
      throw new Error('Mapbox style URLs are not supported by MapLibre; configure an open MapLibre style URL or style object');
    const { accessToken: _ignoredLegacyToken, ...mapOptions } = options;
    return new maplibregl.Map(
      mapOptions as maplibregl.MapOptions
    ) as unknown as ProviderMap;
  }
  createNavigationControl(): ProviderControl {
    return new maplibregl.NavigationControl();
  }
  createStyleSwitcherControl(): ProviderControl {
    // The historical Mapbox style switcher has no configured open-style list.
    // Retain the injectable adapter method without adding a proprietary control.
    return { onAdd: () => document.createElement('div'), onRemove: () => undefined };
  }
}
