// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class ProgramEntryFormConfig {
  program!: string;
  formType!: 'FLAT' | 'SECTION' | 'CUSTOM';
  hideRegistrationUnit?: boolean;
  hideEnrollmentDate?: boolean;
  hideTrackedEntityTypeAttributes?: boolean;
  disableRegistrationUnit?: boolean;
  disableEnrollmentDate?: boolean;
  disabledIncidentDate?: boolean;
  includedProgramStages?: string[];

  constructor(config: Partial<ProgramEntryFormConfig>) {
    Object.assign(this, config);
  }
}
