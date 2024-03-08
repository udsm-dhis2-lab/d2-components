import { format } from 'date-fns';
import { flatten, uniqBy } from 'lodash';
import { BaseVisualizer } from '../../../shared/models/base-visualizer.model';
import {
  SelectionFilterUtil,
  TrackedEntityFilterUtil,
} from '../../../shared/utilities';
declare let mapboxgl: any;
import { StylesControl } from 'mapbox-gl-controls';
import { MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';
// import 'mapbox-gl-controls/lib/controls.css';
// import 'mapbox-gl-style-switcher/styles.css';

export class TrackedEntityLayer extends BaseVisualizer {
  private map: any;
  style =
    'https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json?key=CH1cYDfxBV9ZBu1lHGqh';
  source: any;
  accessToken =
    'pk.eyJ1IjoiaWJyYWhpbXdpY2thbWEiLCJhIjoiY2txM3Y2bXJ1MTJoZjJ2cXI1ZW9pdGg2biJ9.RZjlqK5FxQkQuFrh5lZm_g';

  constructor() {
    super();
    mapboxgl.accessToken = this.accessToken;
  }

  buildInitialMap() {
    let legends: any[] = [];
    let legendTitle: string;
    try {
      this.map = new mapboxgl.Map({
        container: this._id,
        style: this.style,
        center: this._config?.mapCenter,
        zoom: this._config?.zoom || 5,
      });

      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.addControl(new MapboxStyleSwitcherControl());

      const geojson = this.getGeoJSON();

      (geojson.features || []).forEach((marker: any) => {
        const markerEl = document.createElement('div');

        if (!marker?.properties?.useBackgroundColor) {
          markerEl.style.backgroundImage = `url(${marker?.properties?.symbol})`;
          markerEl.style.width = '18px';
          markerEl.style.height = '18px';
          markerEl.style.backgroundSize = '100%';
        } else if (marker?.properties?.useBackgroundColor) {
          markerEl.style.backgroundColor = marker?.properties?.backgroundColor;
          markerEl.style.width = '12px';
          markerEl.style.height = '12px';
          markerEl.style.borderRadius = '50%';
        }

        const markerElement = new mapboxgl.Marker(markerEl)
          .setLngLat(marker.geometry.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(this.getPopupContent(marker)))
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
        this._container.className = 'mapboxgl-ctrl';

        if (this._legends?.length > 1) {
          this._container.innerHTML = `
        <style>
       .legend-ctrl {
            background: white;
            border-radius: 5px;
            padding: 5px 10px;
            box-shadow: 0 0 0 2px rbg(0 0 0 / 10%);
            max-width: 200px;
          }

          .legend-ctrl-items {
            display: flex;
            align-items: center;
          }
          .legend-ctrl-items img {
            height: 24px;
          }

          .legend-ctrl-icon {
            height: 12px;
            width: 12px;
            border-radius: 50%;
          }

          .legend-ctrl-label {
            margin-left: 8px
          }

          .legend-ctrl-title {
            margin-bottom: 8px;
            font-weight: bold;
            font-size: 12px;
          }

        </style>
        <div class="legend-ctrl">
        <div class="legend-ctrl-title">${legendTitle}</div>
        ${this._legends
          .map(
            (legend) => `<div class="legend-ctrl-items">
        ${
          legend.useBackgroundColor
            ? `<div class="legend-ctrl-icon" style="background-color: ${
                legend.backgroundColor || 'gray'
              }"></div>`
            : `<img src="${legend.symbol}" />`
        }
        <div class="legend-ctrl-label">${legend.label}</div>
       </div>`
          )
          .join('')}
        </div>`;
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

  getPopupContent(marker: any) {
    // let htmlContent = this._config?.popUpTemplate || '';
    const htmlContent = `<div>
      <h6>${this._program.name || 'Report details'}</h6>
      ${(marker?.properties?.reportAttributes || [])
        .map(
          (reportAttribute: { label: any; value: any }) =>
            `<div><span style="color: gray">${reportAttribute.label}</span>:&nbsp;${reportAttribute.value}</div>`
        )
        .join('')}
        <div style="border-bottom: 1px rgba(0,0,0,0.1) solid; margin-top: 8px; margin-bottom: 8px"></div>
       ${(marker?.properties.attributes || [])
         .map(
           (
             attribute: any
           ) => ` <div style="display: flex; justify-content: space-between">
       <div style="color: gray">${attribute.label}</div>
       <div>${attribute.value}</div>
     </div>`
         )
         .join('')}
    </div>`;
    // TODO: Find best way to handle custom templates
    // htmlContent = htmlContent.replace(
    //   new RegExp('A<' + marker?.properties?.dimensionItem + '>', 'g'),
    //   marker?.properties?.value
    // );

    return htmlContent;
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
}
