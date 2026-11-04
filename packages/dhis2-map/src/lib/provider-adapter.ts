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
  resize?(): void;
  once(event: 'load', listener: () => void): void;
  on?(event: 'moveend', listener: () => void): void;
  off(event: 'load' | 'moveend', listener: () => void): void;
  getZoom?(): number;
  getBounds?(): {getWest():number;getSouth():number;getEast():number;getNorth():number};
  getSource?(id: string): {setData(data: unknown): void | Promise<void>} | undefined;
  addSource(id: string, source: unknown): void;
  addLayer(layer: unknown): void;
  loadImage?(url: string): Promise<{ data: unknown }>;
  addImage?(id: string, image: unknown): void;
  hasImage?(id: string): boolean;
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
