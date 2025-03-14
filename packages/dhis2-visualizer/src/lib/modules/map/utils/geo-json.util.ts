// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { AnalyticsResult } from '@iapps/function-analytics';
import { LegendSet } from '../../../shared';
import { GeoJSON, MapGeometry, MapGeoFeature, MapLayerType } from '../models';

export class GeoJSONUtil {
  static getGeoJSON(
    geoFeature: MapGeoFeature,
    data: AnalyticsResult,
    legendSet: LegendSet,
    layerType: MapLayerType
  ) {
    const value = GeoJSONUtil.getPropertyValue(data, geoFeature.id);

    const geometry = new MapGeometry().setCoordinates(
      JSON.parse(geoFeature.co)
    );

    if (layerType === 'orgUnit' && geometry.type !== 'Point') {
      geometry.setType('MultiLineString');
    }

    const geoJSON = new GeoJSON()
      .setType('Feature')
      .setGeometry(geometry)
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

  static getPropertyValue(data: AnalyticsResult, ou: string) {
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
