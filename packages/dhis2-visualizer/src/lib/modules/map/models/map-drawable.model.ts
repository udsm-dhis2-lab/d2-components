export interface MapDrawable {
    type: string;
    data: Data;
}

export interface Data {
    type:     string;
    features: Feature[];
}

export interface Feature {
    type:       string;
    properties: Properties;
    geometry:   Geometry;
}

export interface Geometry {
    type:        string;
    coordinates: number[];
}

export interface Properties {
    description: string;
}
