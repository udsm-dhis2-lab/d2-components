// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { BaseQuery, D2HttpClient } from '../../../shared';
import { TrackedEntityType, TrackedEntityTypeField } from '../models';

export class TrackedEntityTypeQuery extends BaseQuery<
  TrackedEntityType,
  TrackedEntityTypeField
> {
  constructor(httpClient: D2HttpClient) {
    super(TrackedEntityType, httpClient);
  }
}
