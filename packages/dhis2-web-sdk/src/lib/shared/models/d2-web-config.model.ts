// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { AxiosDefaults } from 'axios';
export class D2WebConfig {
  baseUrl?: string;
  locale?: string;
  httpClientConfig?: Partial<AxiosDefaults>;

  constructor(config: Partial<D2WebConfig>) {
    this.baseUrl = config?.baseUrl || '../../..';
    this.locale = config?.locale;
    this.httpClientConfig = config?.httpClientConfig || {
      baseURL: this.baseUrl,
    };
  }
}
