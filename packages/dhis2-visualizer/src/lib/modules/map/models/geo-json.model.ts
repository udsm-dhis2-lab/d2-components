// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { MapGeometry } from './geometry.model';
import { GeoJSONType } from './geo-json-type.model';
import { Geometry } from '@turf/turf';

export interface GeoJSONObject {
  type: GeoJSONType;
  geometry: Geometry;
  properties: Record<string, unknown>;
}

export class GeoJSON implements GeoJSONObject {
  type!: GeoJSONType;
  geometry!: MapGeometry;
  properties!: Record<string, unknown>;

  setType(type: GeoJSONType): GeoJSON {
    this.type = type;
    return this;
  }

  setGeometry(geometry: MapGeometry): GeoJSON {
    this.geometry = geometry;
    return this;
  }

  setProperties(properties: Record<string, unknown>): GeoJSON {
    this.properties = properties;
    return this;
  }

  toObject(): GeoJSONObject {
    return {
      type: this.type,
      geometry: this.geometry.toObject(),
      properties: this.properties,
    };
  }
}
