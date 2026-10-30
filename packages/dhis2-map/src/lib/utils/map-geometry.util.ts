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

    const position = (value: unknown): value is [number, number] =>
      Array.isArray(value) && value.length === 2 &&
      value.every((part) => typeof part === 'number' && Number.isFinite(part));
    const ring = (value: unknown): boolean =>
      Array.isArray(value) && value.length > 0 && value.every(position);
    const polygon = (value: unknown): boolean =>
      Array.isArray(value) && value.length > 0 && value.every(ring);
    if (polygon(coordinates)) return 'Polygon';
    if (Array.isArray(coordinates) && coordinates.length > 0 &&
      coordinates.every(polygon)) return 'MultiPolygon';

    return 'Invalid';
  }
}
