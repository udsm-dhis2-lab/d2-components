// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Geometry, GeometryTypes, Position } from '@turf/turf';
import { MapGeometryUtil } from '../utils';

export class MapGeometry implements Geometry {
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
      type: this.type,
      coordinates: this.coordinates,
    };
  }
}
