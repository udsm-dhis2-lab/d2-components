// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { D2HttpClient } from '../../shared';
import { Manifest } from './models';
export class AppManifestModule {
  constructor(private httpClient: D2HttpClient) {}

  async get(): Promise<Manifest | null> {
    let manifest = null;

    try {
      const manifestResponse = await this.httpClient.get('manifest.webapp', {
        useRootUrl: true,
      });

      console.log(manifestResponse);

      manifest = (manifestResponse.data as unknown as Manifest) || null;
    } catch (error) {
      console.warn(
        'Manifest file could not be loaded, default options have been used instead'
      );
    }

    return manifest;
  }
}
