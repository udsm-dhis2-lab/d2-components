import { format } from 'date-fns';
import { flatten, uniqBy } from 'lodash';
import { TrackerVisualizerBase } from './tracker-core';
import { SelectionFilterUtil } from './selection-filter';
import { TrackedEntityFilterUtil } from './tracked-entity-filter';
import * as maplibregl from 'maplibre-gl';

function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value, document.baseURI); return ['https:','http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
function safeColor(value: unknown): string {
  const color=String(value??''); return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i.test(color)?color:'gray';
}

export class TrackedEntityLayer extends TrackerVisualizerBase {
  private map: any;
  style = '';
  source: any;
  accessToken = '';

  setProviderConfig(config: { style: string; accessToken?: string }) {
    this.style = config.style;
    this.accessToken = config.accessToken || '';
    return this;
  }

  constructor() {
    super();
  }

  buildInitialMap() {
    let legends: any[] = [];
    let legendTitle: string;
    try {
      if (this.style.startsWith('mapbox://'))
        throw new Error('Mapbox style URLs are not supported by MapLibre');
      this.map = new maplibregl.Map({
        container: this._id,
        style: this.style || { version: 8, sources: {}, layers: [] },
        center: this._config?.mapCenter,
        zoom: this._config?.zoom || 5,
      });

      this.map.addControl(new maplibregl.NavigationControl());

      const geojson = this.getGeoJSON();

      (geojson.features || []).forEach((marker: any) => {
        const markerEl = document.createElement('div');

        if (!marker?.properties?.useBackgroundColor) {
          const symbol = safeUrl(marker?.properties?.symbol);
          if (symbol) markerEl.style.backgroundImage = `url("${symbol.replace(/"/g, '%22')}")`;
          markerEl.style.width = '18px';
          markerEl.style.height = '18px';
          markerEl.style.backgroundSize = '100%';
        } else if (marker?.properties?.useBackgroundColor) {
          markerEl.style.backgroundColor = safeColor(marker?.properties?.backgroundColor);
          markerEl.style.width = '12px';
          markerEl.style.height = '12px';
          markerEl.style.borderRadius = '50%';
        }

        const markerElement = new maplibregl.Marker({ element: markerEl })
          .setLngLat(marker.geometry.coordinates)
          .setPopup(new maplibregl.Popup().setDOMContent(this.getPopupContent(marker)))
          .addTo(this.map);

        const markerDiv = markerElement.getElement();

        markerDiv.addEventListener('mouseenter', () =>
          markerElement.togglePopup()
        );
        markerDiv.addEventListener('mouseleave', () =>
          markerElement.togglePopup()
        );

        legendTitle = marker?.properties?.dimensionItemLabel;

        legends = uniqBy(
          [
            ...legends,
            {
              symbol: marker?.properties?.symbol,
              useBackgroundColor: marker?.properties?.useBackgroundColor,
              backgroundColor: marker?.properties?.backgroundColor,
              label: marker?.properties?.label,
            },
          ].filter((legend) => legend.label),
          'label'
        );
      });
    } catch (e) {
      console.warn('There ', e);
    }

    class LegendControl {
      private _map: any;
      private _container!: HTMLDivElement;
      private _legends: any[];
      constructor(legends: any[]) {
        this._legends = legends;
      }
      onAdd(map: any) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl';

        if (this._legends?.length > 1) {
          const legendRoot=document.createElement('div');legendRoot.className='legend-ctrl';const title=document.createElement('div');title.className='legend-ctrl-title';title.textContent=legendTitle||'';legendRoot.appendChild(title);
          for(const legend of this._legends){const row=document.createElement('div');row.className='legend-ctrl-items';if(legend.useBackgroundColor){const icon=document.createElement('div');icon.className='legend-ctrl-icon';icon.style.backgroundColor=safeColor(legend.backgroundColor);row.appendChild(icon);}else{const url=safeUrl(legend.symbol);if(url){const image=document.createElement('img');image.src=url;image.alt='';row.appendChild(image);}}const label=document.createElement('div');label.className='legend-ctrl-label';label.textContent=String(legend.label??'');row.appendChild(label);legendRoot.appendChild(row);}this._container.appendChild(legendRoot);
        }
        return this._container;
      }

      onRemove() {
        this._container?.parentNode?.removeChild(this._container);
        this._map = undefined;
      }
    }

    this.map.addControl(new LegendControl(legends), 'bottom-right');
  }

  getPopupContent(marker: any): HTMLElement {
    const root=document.createElement('div');const heading=document.createElement('h6');heading.textContent=String(this._program?.name||'Report details');root.appendChild(heading);
    for(const item of [...(marker?.properties?.reportAttributes||[]),...(marker?.properties?.attributes||[])]){const row=document.createElement('div');const label=document.createElement('span');label.style.color='gray';label.textContent=String(item.label??'');row.append(label,document.createTextNode(`: ${String(item.value??'')}`));root.appendChild(row);}return root;
  }

  getGeoJSON() {
    const customFilter = SelectionFilterUtil.getCustomFilter(
      this._dataSelections
    );

    return {
      type: 'FeatureCollection',
      features: flatten(
        (customFilter
          ? TrackedEntityFilterUtil.filterTrackedEntityInstancesByExpression(
              this._trackedEntityInstances || [],
              customFilter
            )
          : this._trackedEntityInstances || []
        ).map((trackedEntityInstance) => {
          return flatten(
            (trackedEntityInstance.enrollments || []).map((enrollment: any) => {
              const { geometry, orgUnitName, enrollmentDate, incidentDate } =
                enrollment;

              if (!geometry) {
                return [];
              }

              const symbols = this._config?.symbols;

              const attributeValue = this.getAttributeValue(
                symbols,
                trackedEntityInstance
              );

              const markerSymbol = this.getMarkerSymbol(
                symbols,
                attributeValue
              );

              const reportAttributes = this.setReportAttributes(
                orgUnitName,
                enrollmentDate,
                incidentDate
              );

              const attributes = this.getMapAttributes(trackedEntityInstance);

              const dimensionItemObject = attributes.find(
                (attribute: { code: string; value: string }) =>
                  attribute.code === attributeValue?.value
              );

              return {
                type: 'Feature',
                geometry,
                properties: {
                  title: orgUnitName,
                  orgUnitName: orgUnitName,
                  reportAttributes,
                  attributes: attributes.filter(
                    (attribute: any) => attribute?.displayInList
                  ),
                  symbol:
                    markerSymbol?.symbol || './assets/images/marker-dot.svg',
                  useBackgroundColor: markerSymbol?.useBackgroundColor,
                  backgroundColor: markerSymbol?.backgroundColor,
                  value: attributeValue?.value,
                  label: dimensionItemObject?.value || attributeValue?.value,
                  dimensionItem: attributeValue?.attribute,
                  dimensionType: 'ATTRIBUTE',
                  dimensionItemLabel: dimensionItemObject?.label,
                },
              };
            })
          );
        })
      ),
    };
  }

  private getMarkerSymbol(symbols: any, attributeValue: any) {
    if (symbols.useOptionSet) {
      const trackedEntityAttribute = this.findProgramTrackedEntityAttribute(
        symbols.dimensionItem
      )?.trackedEntityAttribute;

      const codedValue = trackedEntityAttribute?.optionSet?.options?.find(
        (option: { code: any }) => option.code === attributeValue?.value
      );

      return {
        useBackgroundColor: true,
        backgroundColor: codedValue?.style?.color,
      };
    }

    return (symbols?.symbols || []).find(
      (symbol: any) => symbol.value === attributeValue?.value
    );
  }

  private getAttributeValue(symbols: any, trackedEntityInstance: any) {
    return symbols?.dimensionType === 'ATTRIBUTE'
      ? trackedEntityInstance.attributes.find(
          (attribute: any) => attribute.attribute === symbols.dimensionItem
        )
      : null;
  }

  private getMapAttributes(trackedEntityInstance: any) {
    return (trackedEntityInstance.attributes || [])
      .map((attribute: any, index: number) => {
        const programTrackedEntityAttribute =
          this.findProgramTrackedEntityAttribute(attribute.attribute);

        if (!programTrackedEntityAttribute) {
          return null;
        }

        const codedValue =
          programTrackedEntityAttribute?.trackedEntityAttribute.optionSet?.options?.find(
            (option: { code: any }) => option.code === attribute.value
          );

        return {
          label:
            programTrackedEntityAttribute?.trackedEntityAttribute?.formName ||
            programTrackedEntityAttribute?.trackedEntityAttribute?.name,
          value: codedValue?.name || attribute.value,
          code: attribute.value,
          sortOrder: programTrackedEntityAttribute?.sortOrder || index,
          displayInList: programTrackedEntityAttribute?.displayInList,
        };
      })
      .filter((attribute: any) => attribute)
      .sort(
        (a: { sortOrder: number }, b: { sortOrder: number }) =>
          a.sortOrder - b.sortOrder
      );
  }

  private findProgramTrackedEntityAttribute(attributeId: string) {
    return (this._program.programTrackedEntityAttributes || []).find(
      (programTrackedEntityAttribute: any) =>
        programTrackedEntityAttribute.trackedEntityAttribute?.id === attributeId
    );
  }

  private setReportAttributes(
    orgUnitName: any,
    enrollmentDate: any,
    incidentDate: any
  ) {
    return [
      {
        value: orgUnitName,
        label: 'Reporting unit',
      },
      {
        value: format(new Date(enrollmentDate), 'MMM dd, yyyy'),
        label: this._program.enrollmentDateLabel || 'Enrollment date',
      },
      {
        value: format(new Date(incidentDate), 'MMM dd, yyyy'),
        label: this._program.enrollmentDateLabel || 'Incident date',
      },
    ];
  }

  draw(): void {
    this.buildInitialMap();
  }

  override dispose(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}
