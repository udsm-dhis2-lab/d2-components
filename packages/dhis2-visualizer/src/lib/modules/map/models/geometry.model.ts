// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style

import { Geometry, GeometryTypes, Position } from '@turf/turf';

// license that can be found in the LICENSE file.
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
    return this;
  }

  toObject(): Geometry {
    return {
      type: this.type,
      coordinates: this.coordinates,
    };
  }
}
