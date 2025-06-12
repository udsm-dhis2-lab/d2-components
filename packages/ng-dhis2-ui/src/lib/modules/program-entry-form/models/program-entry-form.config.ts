// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { FormFieldExtension } from 'packages/ng-dhis2-ui/src/lib/modules/form';

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
  excludeInheritedAttributes?: boolean;
  includedProgramStages?: string[];
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  hideActionButtons?: boolean;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  ignoreRepeatability?: boolean;
  autoAssignedValues?: AutoAssignedValues[];
  hideCustomAssignedFields?: boolean;
  autoComplete?: boolean;
  formFieldExtensions?: FormFieldExtension[];
  updateTeiOrgUnit?: boolean;
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
  excludeInheritedAttributes?: boolean;
  includedProgramStages?: string[];
  submitButtonLabel = 'Submit';
  cancelButtonLabel = 'Cancel';
  hideActionButtons?: boolean;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  ignoreRepeatability?: boolean;
  autoAssignedValues?: AutoAssignedValues[];
  hideCustomAssignedFields?: boolean;
  autoComplete?: boolean;
  formFieldExtensions?: FormFieldExtension[];
  updateTeiOrgUnit: boolean = false;

  constructor(config: IProgramEntryFormConfig) {
    Object.assign(this, config);
  }
}
