// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { BaseQuery, D2HttpClient } from '../../../shared';
import { ProgramSection, ProgramSectionField } from '../models';

export class ProgramSectionQuery extends BaseQuery<
  ProgramSection,
  ProgramSectionField
> {
  constructor(httpClient: D2HttpClient) {
    super(ProgramSection, httpClient);
  }
}
