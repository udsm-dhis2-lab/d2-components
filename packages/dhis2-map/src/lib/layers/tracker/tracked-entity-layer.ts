import type { Feature, Point } from 'geojson';
import { D2Maps } from '../../map-visualizer';
import type { MapProviderAdapter, MapProviderConfig } from '../../provider-adapter';
import { TrackerVisualizerBase } from './tracker-core';
import { SelectionFilterUtil } from './selection-filter';
import { TrackedEntityFilterUtil } from './tracked-entity-filter';
import { TrackedEntityMapLayer, trackerFeatures, trackerSelection } from './tracker-map-layer';

/** Compatibility renderer: D2Maps owns the sole provider and all layer resources. */
export class TrackedEntityLayer extends TrackerVisualizerBase {
  private renderer?: D2Maps;
  private providerConfig?: MapProviderConfig;

  constructor(private readonly provider?: MapProviderAdapter) { super(); }

  setProviderConfig(config: MapProviderConfig): this {
    this.providerConfig = config;
    return this;
  }

  private view(): Record<string, unknown> {
    const nested = this._config?.config;
    const wrapped = nested && typeof nested === 'object' && !Array.isArray(nested)
      ? nested : this._config ?? {};
    const program = this._program || {};
    return { ...wrapped, id:wrapped.id || this._id, layer:'trackedEntity',
      trackedEntityType:wrapped.trackedEntityType || program.trackedEntityType,
      program:wrapped.program || program.id };
  }

  buildInitialMap(): Promise<void> { return this.draw(); }

  async draw(): Promise<void> {
    this.dispose();
    const view = this.view();
    const layer = new TrackedEntityMapLayer(view,undefined,
      this._hasSuppliedInstances ? this._trackedEntityInstances : undefined)
      .setDataSelections(this._dataSelections);
    const renderer = new D2Maps(this.provider).setId(this._id).setBaseUrl(this._baseUrl) as D2Maps;
    if (this.providerConfig) renderer.setProviderConfig(this.providerConfig);
    renderer.addLayer(layer);
    this.renderer = renderer;
    await renderer.draw();
  }

  /** Historical synchronous API; the provider receives only redacted feature properties. */
  getGeoJSON(): {type:'FeatureCollection';features:Feature<Point>[]} {
    const view = this.view();
    const selection = trackerSelection(view,this._dataSelections);
    const filter = SelectionFilterUtil.getCustomFilter(this._dataSelections);
    const instances = filter
      ? TrackedEntityFilterUtil.filterTrackedEntityInstancesByExpression(this._trackedEntityInstances,filter)
      : this._trackedEntityInstances;
    return {type:'FeatureCollection',features:trackerFeatures(instances,selection,
      typeof view['eventPointColor'] === 'string' ? view['eventPointColor'] : undefined)};
  }

  getPopupContent(marker: {properties?: {reportAttributes?: readonly {label?:unknown;value?:unknown}[];
    attributes?: readonly {label?:unknown;value?:unknown}[]}}): HTMLElement {
    const root = document.createElement('div');
    const heading = document.createElement('h6');
    heading.textContent = String(this._program?.name || 'Report details');
    root.appendChild(heading);
    for (const item of [...(marker?.properties?.reportAttributes || []),...(marker?.properties?.attributes || [])]) {
      const row = document.createElement('div');
      const label = document.createElement('span');
      label.textContent = String(item.label ?? '');
      row.append(label,document.createTextNode(`: ${String(item.value ?? '')}`));
      root.appendChild(row);
    }
    return root;
  }

  override dispose(): void {
    this.renderer?.dispose();
    this.renderer = undefined;
  }
}
