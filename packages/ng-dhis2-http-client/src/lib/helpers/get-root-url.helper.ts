import { Manifest } from '../models/manifest.model';
import { DEFAULT_ROOT_URL } from '../constants/http.constant';

export function getRootUrl(manifest?: Manifest) {
  if (!manifest) {
    return DEFAULT_ROOT_URL;
  }

  const rootUrl =
    manifest.activities &&
    manifest.activities.dhis &&
    manifest.activities.dhis.href
      ? manifest.activities.dhis.href
      : DEFAULT_ROOT_URL;

  const hasClosingSlash = (rootUrl || '')
    .slice(rootUrl.length - 1)
    .includes('/');

  return `${rootUrl}${!hasClosingSlash ? '/' : ''}`;
}
