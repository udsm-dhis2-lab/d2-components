// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { BaseQuery, D2HttpClient } from '../../../shared';
import { ProgramStageSection, ProgramStageSectionField } from '../models';

export class ProgramStageSectionQuery extends BaseQuery<
  ProgramStageSection,
  ProgramStageSectionField
> {
  constructor(httpClient: D2HttpClient) {
    super(ProgramStageSection, httpClient);
  }
}
