// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { BaseEventQuery } from './queries';
import { D2HttpClient } from '../../shared';
import { DHIS2Event } from './models';
import { ModelBaseEventQuery } from './queries';

export class EventModule {
  constructor(private httpClient: D2HttpClient) {}

  get event(): BaseEventQuery<DHIS2Event> {
    return new BaseEventQuery(this.httpClient);
  }

  getEventQuery<T extends DHIS2Event>(model: T): ModelBaseEventQuery<T> {
    return new ModelBaseEventQuery(this.httpClient, model);
  }
}
