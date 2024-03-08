export interface MapFeatures {
  type: string;
  id: string;
  geometry: Geometry;
  properties: {
    datavalue: string;
    popupContents: string;
  };
}

export interface Geometry {
  type: string;
  coordinates: string[];
}

export interface DhisGeoFeature {
  id: string;
  code: string;
  na: string;
  hcd: boolean;
  hcu: boolean;
  le: number;
  pg: string;
  pi: string;
  pn: string;
  ty: number;
  co: string;
}
