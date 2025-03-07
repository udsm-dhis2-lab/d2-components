// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import axios from 'axios';
import { Manifest } from './models';
export class AppManifestModule {
  async get(): Promise<Manifest | null> {
    let manifest = null;

    try {
      const manifestResponse = await axios.get<Manifest>('./manifest.webapp');

      manifest = manifestResponse.data || null;
    } catch (error) {
      console.warn(
        'Manifest file could not be loaded, default options have been used instead'
      );
    }

    return manifest;
  }
}
