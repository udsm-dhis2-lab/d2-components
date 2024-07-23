import { MapAnalytics } from '../models/map-analytic.model';
import { MapDrawablePayload } from '../models/map-drawable-payload.model';
import { MapGeoFeature } from '../models/map-geo-feature.model';
import { MapUtil } from '../utils/map.util';
import { MapDrawable } from './map-drawable.class';
import * as _ from 'lodash';
import { Legend, LegendSet } from '../models/legend-set.model';
import { MapView } from '../models/map-dashboard-item.model';
import * as turf from '@turf/turf';
import { D2MapEngine } from '../utils/map-engine.util';
import * as mapboxgl from 'mapbox-gl';

export class ThematicDrawableMap extends MapDrawable {
  /**
   *
   * @param mapUtil
   * @param mapAnalytic
   * @param geoFeature
   * @returns
   */
  public getMapFeaturePayload(
    mapUtil: MapUtil,
    mapView: MapView,
    geoFeature: MapGeoFeature[],
    mapAnalytic: MapAnalytics
  ): MapDrawablePayload | any {
    // CHange Array of GeoFeature to Object of GeoFeature
    const geoFeatureObject: { [key: string]: MapGeoFeature } = _.keyBy(
      geoFeature,
      'id'
    );

    const isValueShown: boolean = mapUtil.getShowValue();
    const isLabelShown: boolean = mapUtil.getShowLabel();

    // Get Index Reference for Organisation Unit in Map Analytics Header Info
    const ouIndex: number = this.getAnalyticHeaderMetadataIndex(
      mapAnalytic,
      'ou'
    );

    if (
      mapView &&
      mapView.thematicMapType &&
      _.toUpper(_.trim(mapView.thematicMapType)) === 'CHOROPLETH'
    ) {
      // Implement Map Feature
      return {
        mapType: mapView?.thematicMapType,
        legendSet: mapView?.legendSet?.id,
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features:
            mapAnalytic && mapAnalytic.rows
              ? _.map(mapAnalytic.rows, (row: string[]) => {
                  const geoFeatureId = row[ouIndex];
                  const mapCoordinates = JSON.parse(
                    geoFeatureObject[geoFeatureId]?.co
                  );

                  return {
                    type: 'Feature',
                    id: geoFeatureId,
                    geometry: {
                      type: 'Polygon',
                      coordinates:
                        mapCoordinates && mapCoordinates.length > 1
                          ? _.flatten(mapCoordinates) &&
                            _.flatten(mapCoordinates).length > 1
                            ? [_.flatten(_.flatten(mapCoordinates))]
                            : _.flatten(mapCoordinates)
                          : mapCoordinates,
                    },
                    properties: {
                      description: this.getToggleBetweenValueAndLabel(
                        mapAnalytic,
                        row,
                        isLabelShown,
                        isValueShown,
                        ouIndex
                      ),

                      value: `${
                        row[
                          this.getAnalyticHeaderMetadataIndex(
                            mapAnalytic,
                            'value'
                          )
                        ]
                      }`,
                      datavalue: parseFloat(
                        row[
                          this.getAnalyticHeaderMetadataIndex(
                            mapAnalytic,
                            'value'
                          )
                        ]
                      ),
                      color: '#ffffff',
                    },
                  };
                })
              : [],
        },
      };
    } else if (
      mapView &&
      mapView.thematicMapType &&
      _.toUpper(_.trim(mapView.thematicMapType)) === 'BUBBLE'
    ) {
      // Implement Return Statement
      return {
        mapType: mapView?.thematicMapType,
        legendSet: mapView?.legendSet?.id,
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          crs: {
            type: 'name',
            properties: {
              name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
            },
          },
          features:
            mapAnalytic && mapAnalytic.rows
              ? _.compact(
                  _.map(mapAnalytic.rows, (row: string[]) => {
                    const geoFeatureId = row[ouIndex];
                    const mapCoordinates = JSON.parse(
                      geoFeatureObject[geoFeatureId]?.co
                    );

                    const dataValue: any = parseFloat(
                      row[
                        this.getAnalyticHeaderMetadataIndex(
                          mapAnalytic,
                          'value'
                        )
                      ]
                    );

                    if (
                      mapCoordinates &&
                      mapCoordinates[0] &&
                      mapCoordinates[0].length > 100
                    ) {
                      const polygon = turf.polygon(
                        mapCoordinates ? mapCoordinates : []
                      );

                      const centroid = turf.centroid(polygon);

                      const centerOfMassPolygon = turf.polygon(mapCoordinates);

                      const mapCenterOfMass =
                        turf.centerOfMass(centerOfMassPolygon);

                      return {
                        type: 'Feature',
                        id: geoFeatureId,
                        geometry: {
                          type: 'Point',
                          coordinates:
                            mapCenterOfMass &&
                            mapCenterOfMass.geometry &&
                            mapCenterOfMass.geometry.coordinates
                              ? [
                                  ...mapCenterOfMass.geometry.coordinates,
                                  +dataValue,
                                ]
                              : [],
                        },
                        properties: {
                          id: geoFeatureId,
                          description: this.getToggleBetweenValueAndLabel(
                            mapAnalytic,
                            row,
                            isLabelShown,
                            isValueShown,
                            ouIndex
                          ),
                          mag: +dataValue,
                          // value: dataValue,
                          // datavalue: dataValue,
                          // color: '#ffffff',
                          time: 1507422626990,
                          felt: null,
                          tsunami: 0,
                        },
                      };
                    } else {
                      return null;
                    }
                  })
                )
              : [],
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      };
    }
  }

  public getAnalyticHeaderMetadataIndex = (
    mapAnalytic: MapAnalytics,
    lookUp: string
  ) => {
    return mapAnalytic && mapAnalytic.headers && lookUp
      ? _.findIndex(mapAnalytic.headers, (data: any) => {
          return _.trim(data.name) == _.trim(lookUp);
        })
      : 0;
  };

  public getLegendSetInfoFromDrawablePayload = (
    legendSets: LegendSet[],
    mapDrawablePayload: MapDrawablePayload
  ) => {
    const legendSetObject: { [key: string]: LegendSet } = _.keyBy(
      legendSets,
      'id'
    );
    return legendSetObject &&
      mapDrawablePayload &&
      mapDrawablePayload.legendSet &&
      legendSetObject[mapDrawablePayload.legendSet]
      ? legendSetObject[mapDrawablePayload.legendSet]
      : legendSets[0];
  };

  public getMapLegendSet = (legendSet: LegendSet): string[] => {
    const legends: Legend[] = _.orderBy(legendSet.legends, ['startValue']);
    return legendSet && legendSet.legends
      ? (_.flatMapDeep([
          _.head(legends)?.startValue,
          _.head(legends)?.color,
          ..._.map(_.drop(legends), (legend: Legend) => {
            return [+`${legend.startValue}`, `${legend.color}`];
          }),
        ]) as string[])
      : [];
  };

  public getMaxValueInLegendSet = (legendSet: LegendSet): number[] => {
    const legends: Legend[] = _.orderBy(legendSet.legends, ['startValue']);
    return _.map(legends, (legend: Legend) => {
      return +legend.endValue;
    });
  };

  public getBubbleCircleRadiusFromLegendSet = (
    maxLegendSetPoints: number[]
  ): number[] => {
    const masterCircleCollections: number[] = [
      10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
    ];
    const combinedPoints: any[][] = _.zip(
      masterCircleCollections,
      maxLegendSetPoints
    ) as any[][];

    const withNoNullPoints: number[][] = _.map(
      combinedPoints,
      (combinedPoints: any[]) => {
        return _.compact(combinedPoints);
      }
    ) as number[][];

    return _.dropRight(
      _.flatten(
        _.filter(withNoNullPoints, (withNoNullPoint: number[]) => {
          return withNoNullPoint.length > 1;
        })
      )
    ) as number[];
  };

  public getToggleBetweenValueAndLabel = (
    mapAnalytic: MapAnalytics,
    row: string[],
    showLabel: boolean,
    showValue: boolean,
    ouIndex: number
  ): any => {
    if (
      showLabel &&
      mapAnalytic.metaData &&
      mapAnalytic.metaData.items &&
      mapAnalytic.metaData.items[row[ouIndex]] &&
      mapAnalytic.metaData.items[row[ouIndex]].name &&
      row &&
      ouIndex &&
      row[ouIndex]
    ) {
      return _.capitalize(
        _.head(_.split(mapAnalytic.metaData.items[row[ouIndex]].name, ' '))
      );
    } else if (showValue) {
      return '';
    }
  };

  public drawNormalThematicLayer(
    mapUtil: MapUtil,
    d2MapEngine: D2MapEngine,
    map: any,
    mapContainerSourceId: string,
    mapDrawablePayload: MapDrawablePayload,
    legendSetContainerId: string,
    mapTitleContainerId: string,
    mapAnalytics: MapAnalytics
  ) {
    // Add Map Source
    const mapDrawableSource = `${mapContainerSourceId}_${mapDrawablePayload?.id}`;

    map.addSource(
      mapDrawableSource,
      _.omit(mapDrawablePayload, [
        'id',
        'mapType',
        'legendSet',
      ]) as mapboxgl.AnySourceData
    );

    const mapLayerId = _.trim(
      `${
        mapDrawablePayload && mapDrawablePayload?.id
          ? mapDrawablePayload?.id
          : mapDrawableSource
      }`
    );

    // Get Legend Set
    const legendSets: LegendSet[] = mapUtil.getLegendSet();

    const selectedLegendSet: LegendSet =
      d2MapEngine.getLegendSetInfoFromDrawablePayload(
        legendSets,
        mapDrawablePayload
      );

    if (selectedLegendSet) {
      // Legend Set for MAP
      const mapLegendSet: string[] =
        d2MapEngine.getMapLegendSet(selectedLegendSet);

      map.addLayer({
        id: `${mapLayerId}_layer`,
        type: 'fill',
        source: mapDrawableSource, // reference the data source
        layout: {},
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'datavalue'],
            ...mapLegendSet,
          ],
          'fill-opacity': 1,
        },
      });

      // Map Typograph Management
      if (mapUtil.getShowLabel()) {
        map.addLayer({
          id: `${mapLayerId}_label`,
          type: 'symbol',
          source: mapDrawableSource,
          layout: {
            'text-field': [
              'format',
              ['upcase', ['get', 'description']],
              { 'font-scale': 0.7 },
              '\n',
              {},
              mapUtil.getShowValue() ? ['downcase', ['get', 'value']] : '',
              { 'font-scale': 0.6 },
            ],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0,
            'text-justify': 'auto',
            'icon-image': ['get', 'icon'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          },
        });
      }

      if (mapUtil.getShowBoundary()) {
        // Adding Boundary Layer
        map.addLayer({
          id: `${mapLayerId}_boundary`,
          type: 'line',
          source: mapDrawableSource,
          layout: {},
          paint: {
            'line-color': '#000',
            'line-width': 1,
          },
        });
      }

      // Appending Legend To The DOM
      this.createLegendSet(
        mapUtil,
        d2MapEngine,
        mapAnalytics,
        legendSets[0],
        legendSetContainerId
      );

      // Added Map Title
      this.createMapTitle(
        mapAnalytics,
        mapUtil.getShowMapTitle(),
        mapTitleContainerId
      );

      // Remove Details Section On Start
      const infoContainerId = mapUtil.getInfoContainerId();
      const featuresDOMElement = document.getElementById(infoContainerId);
      if (featuresDOMElement) {
        featuresDOMElement.style.display = 'none';
      }

      // When a click event occurs on a feature in the states layer,
      // open a popup at the location of the click, with description
      // HTML from the click event's properties.
      map.on('click', mapLayerId, (mapMouseEvent: any) => {
        const description = mapMouseEvent.features[0].properties.description;
        const value = mapMouseEvent.features[0].properties.value;

        const popUpMessage = `<p>${
          description ? description : ''
        } (${value})</p>`;

        // Create a popup, but don't add it to the map yet.
        const mapBoxPopUp = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: true,
        });

        mapBoxPopUp
          .setLngLat(mapMouseEvent.lngLat)
          .setHTML(popUpMessage)
          .addTo(map);

        map.flyTo({
          center: mapMouseEvent.features[0].geometry.coordinates,
        });
      });

      // On Mouse Move
      map.on('mousemove', mapLayerId, (event: any) => {
        map.getCanvas().style.cursor = 'pointer';

        // Create a popup, but don't add it to the map yet.
        const mapBoxPopUp = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        if (mapUtil.getShowMapSummary()) {
          const mapboxGeoJSONFeature: mapboxgl.MapboxGeoJSONFeature[] =
            map.queryRenderedFeatures(event.point, {
              layers: [mapContainerSourceId],
            });
          // Added support for hover details on map
          this.createHoverDetails(
            mapboxGeoJSONFeature,
            mapAnalytics,
            infoContainerId
          );
        }
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', mapLayerId, () => {
        map.getCanvas().style.cursor = '';
      });
    } else {
      console.log(`Legend Set Not Found for ${mapLayerId}`);
    }
  }

  public drawBubbleThematicLayer(
    mapUtil: MapUtil,
    d2MapEngine: D2MapEngine,
    map: any,
    mapDrawablePayload: MapDrawablePayload,
    mapContainerSourceId: string
  ) {
    // Add Map Source
    const mapDrawableSource = `${mapContainerSourceId}_${mapDrawablePayload?.id}`;

    map.addSource(
      `${mapDrawableSource}`,
      _.omit(mapDrawablePayload, [
        'id',
        'mapType',
        'legendSet',
      ]) as mapboxgl.AnySourceData
    );

    const mapLayerId = _.trim(
      `${
        mapDrawablePayload && mapDrawablePayload?.id
          ? mapDrawablePayload?.id
          : mapContainerSourceId
      }`
    );

    // Get Legend Set
    const legendSets: LegendSet[] = mapUtil.getLegendSet();

    const selectedLegendSet: LegendSet =
      d2MapEngine.getLegendSetInfoFromDrawablePayload(
        legendSets,
        mapDrawablePayload
      );

    if (selectedLegendSet) {
      // Legend Set for MAP
      const mapLegendSet: string[] =
        d2MapEngine.getMapLegendSet(selectedLegendSet);

      // Max Legend Set Points for MAP
      const maxLegendSetPoints: number[] =
        d2MapEngine.getMaxValueInLegendSet(selectedLegendSet);

      // MAPBOX Bubble Legend Set Values
      const bubbleCircleRadiiFromLegendSet: number[] =
        d2MapEngine.getBubbleCircleRadiusFromLegendSet(maxLegendSetPoints);

      map.addLayer({
        id: `${mapLayerId}_layer`,
        type: 'circle',
        source: mapDrawableSource,
        filter: ['has', 'mag'],
        paint: {
          'circle-color': ['step', ['get', 'mag'], '#eeeeee', ...mapLegendSet],
          'circle-radius': [
            'step',
            ['get', 'mag'],
            ...bubbleCircleRadiiFromLegendSet,
          ],
        },
      });

      map.addLayer({
        id: `${mapLayerId}_layer_clustered`,
        type: 'symbol',
        source: mapDrawableSource,
        filter: ['has', 'mag'],
        layout: {
          'text-field': '{mag}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      map.addLayer({
        id: `${mapLayerId}_layer_unclustered`,
        type: 'circle',
        source: mapDrawableSource,
        filter: ['!', ['has', 'mag']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });
    } else {
      console.log(`Legend Set Not Found for ${mapLayerId}`);
    }
  }

  /**
   *
   */
  public createLegendSet(
    mapUtil: MapUtil,
    d2MapEngine: D2MapEngine,
    mapAnalytics: MapAnalytics,
    legendSet: LegendSet,
    legendSetContainerId: string
  ) {
    const legendDOMElement = document.getElementById(legendSetContainerId);
    const showLegend: boolean = mapUtil.getShowLegend();

    if (
      showLegend &&
      legendSet &&
      legendSet.legends &&
      legendSet.legends.length
    ) {
      if (legendDOMElement) {
        legendDOMElement.innerHTML = '';
        legendDOMElement.style.display = 'block';
      }

      const legendDIVItem: HTMLDivElement = document.createElement('div');
      const legendTableItem = document.createElement('table');
      const legendTableBodyItem = document.createElement('tbody');
      const legendTableHead = document.createElement('thead');
      const legendTableHeadItem = document.createElement('tr');
      const legendTableHRLineItem = document.createElement('tr');
      const legendTableHRLineTDItem = document.createElement('td');

      const legendTableDataItemTitleSection = document.createElement('th');
      const legendTableHeadHorizontalLine = document.createElement('hr');

      legendTableHeadHorizontalLine.setAttribute('style', `width: 100%`);

      legendTableDataItemTitleSection.innerHTML = `<label>${legendSet?.name}</label>`;
      legendTableDataItemTitleSection.setAttribute('colspan', '3');
      legendTableHRLineTDItem.setAttribute('colspan', '3');

      legendTableHeadItem.appendChild(legendTableDataItemTitleSection);
      legendTableHead.appendChild(legendTableHeadItem);
      legendTableItem.appendChild(legendTableHead);
      legendTableHRLineTDItem.appendChild(legendTableHeadHorizontalLine);
      legendTableHRLineItem.appendChild(legendTableHRLineTDItem);
      legendTableHead.appendChild(legendTableHRLineItem);

      const dataValueIndex: number = d2MapEngine.getAnalyticHeaderMetadataIndex(
        mapAnalytics,
        'value'
      );

      const values: number[] = _.map(
        mapAnalytics.rows,
        (row: string[]) => +row[dataValueIndex]
      );

      const legendsWithCountValues: Legend[] = _.map(
        legendSet.legends,
        (legend: Legend) => {
          return {
            ...legend,
            itemCount: _.filter(values, (value: number) => {
              return value >= legend.startValue && value <= legend.endValue;
            })?.length,
          };
        }
      );

      const legends: Legend[] = _.orderBy(legendsWithCountValues, [
        'startValue',
      ]) as Legend[];

      for (const legend of legends) {
        const legendTableRowItem = document.createElement('tr');

        const legendTableDataItemColorSection = document.createElement('td');
        legendTableDataItemColorSection.setAttribute(
          'style',
          `width: 20px; margin-right: 10px !important; font-weight: bold !important;`
        );

        const legendTableDataItemLabel = document.createElement('td');
        const legendTableDataItemCount = document.createElement('td');

        legendTableDataItemColorSection.style.backgroundColor = legend?.color;
        legendTableDataItemLabel.innerHTML = `<label>${legend?.name} ${legend?.startValue} - ${legend?.endValue} (${legend?.itemCount})</label>`;
        // legendTableDataItemCount.innerHTML = `${legend?.name}`;

        legendTableRowItem.appendChild(legendTableDataItemColorSection);
        legendTableRowItem.appendChild(legendTableDataItemLabel);
        legendTableRowItem.appendChild(legendTableDataItemCount);
        legendTableBodyItem.appendChild(legendTableRowItem);
        legendTableItem.appendChild(legendTableBodyItem);
        legendDIVItem.appendChild(legendTableItem);
        legendDOMElement?.appendChild(legendDIVItem);
      }
    } else {
      if (legendDOMElement) {
        legendDOMElement.innerHTML = '';
        legendDOMElement.style.display = 'none';
      }
    }
  }

  /**
   *
   */
  createHoverDetails(
    mapboxGeoJSONFeature: mapboxgl.MapboxGeoJSONFeature[],
    mapAnalytics: MapAnalytics,
    infoContainerId: string
  ) {
    const dataName: string | undefined =
      mapAnalytics &&
      mapAnalytics.metaData &&
      mapAnalytics.metaData.dimensions &&
      mapAnalytics.metaData.dimensions.dx &&
      _.head(mapAnalytics.metaData.dimensions.dx)
        ? _.head(mapAnalytics.metaData.dimensions.dx)
        : '';

    if (dataName) {
      const indicatorName: string =
        mapAnalytics &&
        mapAnalytics.metaData &&
        mapAnalytics.metaData.items &&
        mapAnalytics.metaData.items[dataName] &&
        mapAnalytics.metaData.items[dataName].name
          ? mapAnalytics.metaData.items[dataName].name
          : '';

      const periodId: string | undefined =
        mapAnalytics &&
        mapAnalytics.metaData &&
        mapAnalytics.metaData.dimensions &&
        mapAnalytics.metaData.dimensions.pe &&
        _.head(mapAnalytics.metaData.dimensions.pe)
          ? _.head(mapAnalytics.metaData.dimensions.pe)
          : '';

      const periodName =
        mapAnalytics &&
        periodId &&
        mapAnalytics.metaData &&
        mapAnalytics.metaData.items &&
        mapAnalytics.metaData.items[periodId] &&
        mapAnalytics.metaData.items[periodId].name
          ? mapAnalytics.metaData.items[periodId].name
          : '';

      const mapInfoDOMElement = document.getElementById(infoContainerId);
      const info: any = _.head(mapboxGeoJSONFeature);

      let htmlCode = ``;
      if (mapInfoDOMElement) {
        mapInfoDOMElement.style.display = 'block';
        if (dataName && mapboxGeoJSONFeature) {
          htmlCode += `<table>`;
          htmlCode += `<thead>`;
          htmlCode += `</thead>`;
          htmlCode += `<tbody>`;

          if (
            info &&
            info.properties &&
            info.properties.value &&
            info.properties.value
          ) {
            htmlCode += `<tr>`;
            htmlCode += `<td><b>Region:</b><label>${info.properties?.description}</label></td>`;
            htmlCode += `</tr>`;
            htmlCode += `<tr>`;
            htmlCode += `<td><b>Data:</b><label>${indicatorName}</label></td>`;
            htmlCode += `</tr>`;
            htmlCode += `<tr>`;
            htmlCode += `<td><b>Period:</b><label>${periodName}</label></td>`;
            htmlCode += `</tr>`;
            htmlCode += `<tr>`;
            htmlCode += `<td><b>Value:</b><label>${info.properties.value}</label></td>`;
            htmlCode += `</tr>`;
          } else {
            htmlCode += `<td>Hover on the map for more info! </td>`;
            htmlCode += `</tr>`;
            htmlCode += `</tr>`;
          }
          htmlCode += `<tfoot>`;
          htmlCode += `</tfoot>`;
          mapInfoDOMElement.innerHTML = htmlCode;
        } else {
          mapInfoDOMElement.innerHTML = `<p>Hover over a state!</p>`;
        }
      }
    }
  }

  /**
   *
   */
  createMapTitle(
    mapAnalytics: MapAnalytics,
    showMapTitle: boolean,
    mapTitleContainerId: string
  ) {
    const mapTitleDOMElement = document.getElementById(mapTitleContainerId);

    if (showMapTitle) {
      const dataName: string | undefined =
        mapAnalytics &&
        mapAnalytics.metaData &&
        mapAnalytics.metaData.dimensions &&
        mapAnalytics.metaData.dimensions.dx &&
        _.head(mapAnalytics.metaData.dimensions.dx)
          ? _.head(mapAnalytics.metaData.dimensions.dx)
          : '';

      if (dataName) {
        const indicatorName: string =
          mapAnalytics &&
          mapAnalytics.metaData &&
          mapAnalytics.metaData.items &&
          mapAnalytics.metaData.items[dataName] &&
          mapAnalytics.metaData.items[dataName].name
            ? mapAnalytics.metaData.items[dataName].name
            : '';

        const periodId: string | undefined =
          mapAnalytics &&
          mapAnalytics.metaData &&
          mapAnalytics.metaData.dimensions &&
          mapAnalytics.metaData.dimensions.pe &&
          _.head(mapAnalytics.metaData.dimensions.pe)
            ? _.head(mapAnalytics.metaData.dimensions.pe)
            : '';

        if (mapTitleDOMElement && periodId && indicatorName) {
          const periodName =
            mapAnalytics &&
            mapAnalytics.metaData &&
            mapAnalytics.metaData.items &&
            mapAnalytics.metaData.items[periodId] &&
            mapAnalytics.metaData.items[periodId].name
              ? mapAnalytics.metaData.items[periodId].name
              : '';

          let htmlCode = ``;
          htmlCode += `<label>${indicatorName} - ${periodName}</label>`;

          mapTitleDOMElement.innerHTML = htmlCode;
        }
      }
    } else {
      if (mapTitleDOMElement) {
        mapTitleDOMElement.innerHTML = '';
      }
    }
  }
}
