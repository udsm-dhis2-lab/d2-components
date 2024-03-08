import { SystemInfo } from '../models/system-info.model';

export function getSystemVersion(systemInfo: SystemInfo): number {
  if (!systemInfo) {
    return 0;
  }
  const splitedVersion = systemInfo.version
    ? systemInfo.version.split('.')
    : [];
  return parseInt(splitedVersion[1], 10) || 0;
}
