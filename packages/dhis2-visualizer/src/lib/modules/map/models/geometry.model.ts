// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Geometry, Position } from 'geojson';
import { MapGeometryUtil } from '../utils';

export type GeometryTypes = 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';

export class MapGeometry {
  coordinates!: Position | Position[] | Position[][] | Position[][][];
  type!: string;

  setType(type: GeometryTypes) {
    this.type = type;
    return this;
  }

  setCoordinates(
    coordinates: Position | Position[] | Position[][] | Position[][][]
  ) {
    this.coordinates = coordinates;
    const type = MapGeometryUtil.determineGeometryType(coordinates);

    if (type !== 'Invalid') {
      return this.setType(type);
    }

    return this;
  }

  toObject(): Geometry {
    return {
      type: this.type as any,
      coordinates: this.coordinates as any,
    };
  }
}
