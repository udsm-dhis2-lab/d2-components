// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { D2HttpClient } from '../../shared';
import { SystemInfo } from './models';

export class SystemModule {
  constructor(private httpClient: D2HttpClient) {}

  async getSystemInfo(): Promise<SystemInfo | null> {
    const systemInfoResponse = await this.httpClient.get('system/info');

    return systemInfoResponse.data
      ? new SystemInfo(systemInfoResponse.data)
      : null;
  }
}
