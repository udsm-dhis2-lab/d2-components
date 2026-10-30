import type { MapLayer } from './layers/map-layer.model';
import type { ProviderMap } from './provider-adapter';

export interface MapLayerDefinition {
  readonly kind: string;
  load(layer: MapLayer, signal: AbortSignal): Promise<void>;
  render(layer: MapLayer, map: ProviderMap): void;
}

/** Registry owns dispatch, never the provider or the layer's lifecycle. */
export class MapLayerRegistry {
  private readonly definitions = new Map<string, MapLayerDefinition>();
  register(definition: MapLayerDefinition): this {
    if (this.definitions.has(definition.kind)) throw new Error(`Duplicate map layer definition: ${definition.kind}`);
    this.definitions.set(definition.kind, definition);
    return this;
  }
  has(kind: string): boolean { return this.definitions.has(kind); }
  resolve(kind: string): MapLayerDefinition {
    const definition = this.definitions.get(kind);
    if (!definition) throw new Error(`Unsupported map layer definition: ${kind}`);
    return definition;
  }
}
