import { MapGeoFeature } from './map-geo-feature.model';

export interface GeoFeatureSnapshot {
  id: string;
  geoFeatures: MapGeoFeature[];
}
