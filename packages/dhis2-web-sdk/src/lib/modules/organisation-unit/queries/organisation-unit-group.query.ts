// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { BaseQuery, D2HttpClient } from '../../../shared';
import { OrganisationUnitGroup, OrganisationUnitGroupField } from '../models';
export class OrganisationUnitGroupQuery extends BaseQuery<
  OrganisationUnitGroup,
  OrganisationUnitGroupField
> {
  constructor(httpClient: D2HttpClient) {
    super(OrganisationUnitGroup, httpClient);
  }
}
