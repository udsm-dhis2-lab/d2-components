// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export type AutoAssignedValues = { field: string; value: string };

export interface IProgramEntryFormConfig {
  program: string;
  programStage?: string;
  displayType: 'FLAT' | 'SECTION' | 'CUSTOM';
  formType: 'TRACKER' | 'EVENT';
  hideRegistrationUnit?: boolean;
  hideEnrollmentDate?: boolean;
  hideTrackedEntityTypeAttributes?: boolean;
  disableRegistrationUnit?: boolean;
  disableEnrollmentDate?: boolean;
  disabledIncidentDate?: boolean;
  excludeProgramStages?: boolean;
  includedProgramStages?: string[];
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  hideActionButtons?: boolean;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  ignoreRepeatability?: boolean;
  autoAssignedValues?: AutoAssignedValues[];
}
export class ProgramEntryFormConfig implements IProgramEntryFormConfig {
  program!: string;
  programStage?: string;
  displayType: 'FLAT' | 'SECTION' | 'CUSTOM' = 'FLAT';
  formType!: 'TRACKER' | 'EVENT';
  hideRegistrationUnit?: boolean;
  hideEnrollmentDate?: boolean;
  hideTrackedEntityTypeAttributes?: boolean;
  disableRegistrationUnit?: boolean;
  disableEnrollmentDate?: boolean;
  disabledIncidentDate?: boolean;
  excludeProgramStages?: boolean;
  includedProgramStages?: string[];
  submitButtonLabel = 'Submit';
  cancelButtonLabel = 'Cancel';
  hideActionButtons?: boolean;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  ignoreRepeatability?: boolean;
  autoAssignedValues?: AutoAssignedValues[];

  constructor(config: IProgramEntryFormConfig) {
    Object.assign(this, config);
  }
}
