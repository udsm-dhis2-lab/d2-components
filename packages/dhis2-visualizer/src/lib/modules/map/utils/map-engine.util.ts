import * as _ from 'lodash';
import { ThematicDrawableMap } from '../class/thematic';
import { MapAnalytics } from '../models/map-analytic.model';
import {
  MapDashboardExtensionItem,
  MapViewExtension,
} from '../models/map-dashboard-extension.model';
import { MapDashboardItem, MapView } from '../models/map-dashboard-item.model';
import { MapDrawablePayload } from '../models/map-drawable-payload.model';
import { GeoFeatureSnapshot } from '../models/map-geofeature-snapshot.model';
import { MapGeoFeature } from '../models/map-geo-feature.model';
import { MapUtil } from './map.util';

/**
 *
 */
export class D2MapEngine extends ThematicDrawableMap {
  /**
   * @description Set map type
   */
  private type: string;

  /**
   * @description Set map type
   */
  constructor() {
    super();
    this.type = 'thematic';
  }

  /**
   *
   * @param type
   * @returns
   */
  setMapType(type: string): D2MapEngine {
    this.type = type;
    return this;
  }

  /**
   *
   * @returns
   */
  getMapType(): string {
    return this.type;
  }

  /**
   *
   * @param type
   * @param mapUtil
   * @param geoFeatures
   * @param mapAnalytics
   * @returns
   */
  getMapDrawablePayload(
    type: string,
    mapUtil: MapUtil,
    geoFeatures: GeoFeatureSnapshot[],
    mapAnalytics: MapAnalytics[],
    mapDashboardItem: MapDashboardItem,
    mapDashboardExtensionItem: MapDashboardExtensionItem
  ): MapDrawablePayload[] | any {
    this.setMapType(type);

    const thematicDrawableMap = new ThematicDrawableMap();

    const mapLayers = [];

    const mapDashboardItemSanitized: MapDashboardItem =
      this.getSanitizedMapDrawableItem(
        mapDashboardItem,
        mapDashboardExtensionItem
      );

    const geoFeatureObject: { [key: string]: GeoFeatureSnapshot } = _.keyBy(
      geoFeatures,
      'id'
    );

    const analyticsObject: { [key: string]: MapAnalytics } = _.keyBy(
      mapAnalytics,
      'id'
    );

    if (mapDashboardItemSanitized) {
      for (const mapItem of mapDashboardItemSanitized.map.mapViews) {
        const sanitizedGeofeatures: MapGeoFeature[] =
          mapItem &&
          mapItem.id &&
          geoFeatureObject &&
          geoFeatureObject[mapItem.id] &&
          geoFeatureObject[mapItem.id].geoFeatures
            ? geoFeatureObject[mapItem.id].geoFeatures
            : [];

        const sanitizedAnalytics: MapAnalytics | any =
          mapItem &&
          mapItem.id &&
          analyticsObject &&
          analyticsObject[mapItem.id]
            ? analyticsObject[mapItem.id]
            : [];

        if (
          mapItem &&
          mapItem.layer &&
          _.toLower(_.trim(mapItem.layer)) === 'thematic'
        ) {
          // Implement Section
          const mapDrawablePayload: MapDrawablePayload =
            thematicDrawableMap.getMapFeaturePayload(
              mapUtil,
              mapItem,
              sanitizedGeofeatures,
              sanitizedAnalytics
            );
          mapLayers.push({ ...mapDrawablePayload, id: mapItem.id });
        } else {
          // Implement Section
        }
      }
      return mapLayers;
    }

    // if (this.type === 'thematic') {
    //     const thematicDrawableMap = new ThematicDrawableMap();
    //     return thematicDrawableMap.getMapFeaturePayload(
    //         mapUtil,
    //         geoFeatures,
    //         mapAnalytics
    //     );
    // }
  }

  getSanitizedMapDrawableItem(
    mapDashboardItem: MapDashboardItem,
    mapDashboardExtensionItem: MapDashboardExtensionItem
  ): MapDashboardItem {
    return {
      ...mapDashboardItem,
      map: {
        ...mapDashboardItem.map,
        mapViews: _.map(mapDashboardItem.map.mapViews, (mapView: MapView) => {
          const mapViewExtensionObject: { [key: string]: MapViewExtension } =
            _.keyBy(mapDashboardExtensionItem.map.mapViews, 'id');

          return {
            ...mapView,
            layer:
              mapView &&
              mapView.id &&
              mapViewExtensionObject &&
              mapViewExtensionObject[mapView.id] &&
              mapViewExtensionObject[mapView.id].layer
                ? mapViewExtensionObject[mapView.id].layer
                : mapView.layer,
            thematicMapType:
              mapView &&
              mapView.id &&
              mapViewExtensionObject &&
              mapViewExtensionObject[mapView.id] &&
              mapViewExtensionObject[mapView.id].thematicMapType
                ? mapViewExtensionObject[mapView.id].thematicMapType
                : mapView.thematicMapType,
          };
        }),
      },
    };
  }
}
