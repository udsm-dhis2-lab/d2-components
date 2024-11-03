// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { D2HttpClient } from '../../shared';
import {
  OrganisationUnitQuery,
  OrganisationUnitGroupQuery,
  OrganisationUnitGroupSetQuery,
} from './queries';
export class OrganisationUnitModule {
  constructor(private httpClient: D2HttpClient) {}
  get organisationUnit(): OrganisationUnitQuery {
    return new OrganisationUnitQuery(this.httpClient);
  }

  get organisationUnitGroup(): OrganisationUnitGroupQuery {
    return new OrganisationUnitGroupQuery(this.httpClient);
  }

  get organisationUnitGroupSet(): OrganisationUnitGroupSetQuery {
    return new OrganisationUnitGroupSetQuery(this.httpClient);
  }
}
