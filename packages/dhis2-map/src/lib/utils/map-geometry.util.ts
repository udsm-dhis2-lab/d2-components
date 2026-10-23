// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class MapGeometryUtil {
  static determineGeometryType(coordinates: any) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return 'Invalid';
    }

    // Check if it's a Point
    if (
      coordinates.length === 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      return 'Point';
    }

    // Check if it's a Polygon
    if (Array.isArray(coordinates[0])) {
      // A Polygon should have at least one ring of coordinates
      for (const ring of coordinates) {
        if (
          !Array.isArray(ring) ||
          ring.length === 0 ||
          !Array.isArray(ring[0])
        ) {
          return 'Invalid';
        }
        // Check if each coordinate pair in the ring is valid
        for (const coord of ring) {
          if (
            coord.length !== 2 ||
            typeof coord[0] !== 'number' ||
            typeof coord[1] !== 'number'
          ) {
            return 'Invalid';
          }
        }
      }
      return 'Polygon';
    }

    return 'Invalid';
  }
}
