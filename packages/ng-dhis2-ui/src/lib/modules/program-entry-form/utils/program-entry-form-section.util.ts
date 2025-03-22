// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Program } from '@iapps/d2-web-sdk';
import { IProgramEntryFormSection, ProgramEntryFormConfig } from '../models';

export class ProgramEntryFormSectionUtil {
  constructor(
    private program: Program,
    private config: ProgramEntryFormConfig
  ) {}

  get sections(): IProgramEntryFormSection[] {
    return [];
  }
}
