import { Manifest } from '../models/manifest.model';
import { DEFAULT_ROOT_URL } from '../constants/http.constant';

export function getRootUrl(manifest?: Manifest) {
  if (!manifest) {
    return DEFAULT_ROOT_URL;
  }

  return manifest.activities &&
    manifest.activities.dhis &&
    manifest.activities.dhis.href
    ? manifest.activities.dhis.href
    : DEFAULT_ROOT_URL;
}
