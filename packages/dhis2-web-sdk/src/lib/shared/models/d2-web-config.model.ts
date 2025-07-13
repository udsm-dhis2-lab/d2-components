// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { AxiosDefaults } from 'axios';
import { ID2IndexDbConfig } from '../interfaces';
import { D2IndexDbConfig } from './index-db-config.model';
export class D2WebConfig {
  baseUrl?: string;
  locale?: string;
  httpClientConfig?: Partial<AxiosDefaults>;
  indexDBConfig?: ID2IndexDbConfig;

  constructor(config: Partial<D2WebConfig>) {
    this.baseUrl = config?.baseUrl || '../../..';
    this.locale = config?.locale;
    this.httpClientConfig = config?.httpClientConfig || {};
    this.indexDBConfig = new D2IndexDbConfig(config?.indexDBConfig);
  }
}
