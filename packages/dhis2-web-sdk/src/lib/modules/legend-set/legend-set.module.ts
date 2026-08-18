// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { D2HttpClient } from '../../shared';
import { LegendQuery, LegendSetQuery } from './queries';

export class LegendSetModule {
  constructor(private httpClient: D2HttpClient) {}

  get legendSet(): LegendSetQuery {
    return new LegendSetQuery(this.httpClient);
  }

  get legend(): LegendQuery {
    return new LegendQuery(this.httpClient);
  }
}
