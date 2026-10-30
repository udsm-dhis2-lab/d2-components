// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import type { MapAnalytics } from '../map-data-source';
import type { LegendSet } from '../models/legend-set.model';
import { GeoJSON, MapGeometry, MapGeoFeature, MapLayerType } from '../models';

export class GeoJSONUtil {
  static getGeoJSON(
    geoFeature: MapGeoFeature,
    data: MapAnalytics,
    legendSet: LegendSet,
    layerType: MapLayerType
  ) {
    const value = GeoJSONUtil.getPropertyValue(data, geoFeature.id);

    const geometry = new MapGeometry().setCoordinates(
      JSON.parse(geoFeature.co)
    );

    if (layerType === 'orgUnit' && geometry.type !== 'Point') {
      if (geometry.type === 'MultiPolygon')
        geometry.setCoordinates((geometry.coordinates as number[][][][]).flat() as any);
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

  static getPropertyValue(data: MapAnalytics, ou: string) {
    if (!data) {
      return null;
    }

    const value = (data.rows || []).find((row: any) => row.ou?.id === ou)?.[
      'value'
    ];

    return value == null ? null : Number(value);
  }

  static getPropertyColor(value: number, legendSet: LegendSet) {
    if (value == null) {
      return '#ffffff';
    }

    return (
      (legendSet?.legends || []).find(
        (legend) => value >= legend.startValue && value < legend.endValue
      )?.color || '#f5f5f5'
    );
  }
}
