export interface MapDrawablePayload {
  id?: string;
  mapType?: string;
  legendSet?: string;
  type: string;
  data: Data;
}

export interface Data {
  type: string;
  features: Feature[];
}

export interface Feature {
  type: string;
  id: string | number;
  // geometry: Geometry;
  properties: Properties;
}

export interface Properties {
  description: string;
  value: string;
  datavalue: number;
  color: string;
}
