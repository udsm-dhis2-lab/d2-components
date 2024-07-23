// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { LegendSet } from '../../../shared';
import { GeoJSON, MapGeometry, MapGeoFeature, MapLayerType } from '../models';

export class GeoJSONUtil {
  static getGeoJSON(
    geoFeature: MapGeoFeature,
    data: any,
    legendSet: LegendSet,
    layerType: MapLayerType
  ) {
    const value = GeoJSONUtil.getPropertyValue(data, geoFeature.id);

    if (!value && layerType !== 'boundary' && layerType !== 'orgUnit') {
      return null;
    }

    const geoJSON = new GeoJSON()
      .setType('Feature')
      .setGeometry(new MapGeometry().setCoordinates(JSON.parse(geoFeature.co)))
      .setProperties({
        value,
        color: GeoJSONUtil.getPropertyColor(value as number, legendSet),
        name: (geoFeature as any)['na'],
      });

    if (!geoJSON.geometry.type || geoJSON.geometry.type === 'Invalid') {
      return null;
    }

    return geoJSON;
  }

  static getPropertyValue(data: any, ou: string) {
    if (!data) {
      return null;
    }

    const value = (data.rows || []).find(
      (row: any) => row.ou?.id === ou
    )?.value;

    return value ? Number(value) : null;
  }

  static getPropertyColor(value: number, legendSet: LegendSet) {
    if (!value) {
      return undefined;
    }

    return (legendSet?.legends || []).find(
      (legend) => value >= legend.startValue && value < legend.endValue
    )?.color;
  }
}
