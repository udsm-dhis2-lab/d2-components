// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
interface D2DatabaseInfo {
  name: string;
  user: string;
  url: string;
  databaseVersion: string;
  spatialSupport: boolean;
  time: string;
}

export interface SystemInitInfo {
  baseUrl: string;
  apiVersion: number;
}

export class SystemInfo {
  contextPath!: string;
  userAgent!: string;
  calendar!: string;
  dateFormat!: string;
  serverDate!: string;
  serverTimeZoneId!: string;
  serverTimeZoneDisplayName!: string;
  lastAnalyticsTableSuccess!: string;
  intervalSinceLastAnalyticsTableSuccess!: string;
  lastAnalyticsTableRuntime!: string;
  databaseInfo!: D2DatabaseInfo;
  version!: string;
  revision!: string;
  buildTime!: string;
  jasperReportsVersion!: string;
  environmentVariable!: string;
  fileStoreProvider!: string;
  readOnlyMode!: string;
  nodeId!: string;
  javaVersion!: string;
  javaVendor!: string;
  osName!: string;
  osArchitecture!: string;
  osVersion!: string;
  externalDirectory!: string;
  readReplicaCount!: number;
  memoryInfo!: string;
  cpuCores!: number;
  encryption!: boolean;
  emailConfigured!: boolean;
  redisEnabled!: boolean;
  systemId!: string;
  systemName!: string;
  clusterHostname!: string;
  isMetadataVersionEnabled!: boolean;

  get baseUrl(): string {
    return document?.location?.host?.includes('localhost')
      ? `${document.location.protocol}//${document.location.host}`
      : this.contextPath;
  }

  get apiVersion(): number {
    return Number(((this.version || '')?.split('.') || [])[1]);
  }

  constructor(params?: Partial<SystemInfo>) {
    if (params) {
      Object.keys(params).forEach((key) => {
        (this as any)[key] = (params as Record<string, unknown>)[key];
      });
    }
  }

  toInitObject(): SystemInitInfo {
    return {
      baseUrl: this.baseUrl,
      apiVersion: this.apiVersion,
    };
  }
}
