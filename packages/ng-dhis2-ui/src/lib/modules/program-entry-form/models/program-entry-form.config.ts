// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { FormFieldExtension } from '../../form';
import { CoordinatePickerGeoConfig } from '../../form/components/coordinate-field-component';
import { OptionsPathCascadeConfig } from '../../form/models/field-cascade.types';

export type AutoAssignedValues = { field: string; value: string };

export interface IProgramEntryFormConfig {
  program: string;
  programStage?: string;
  displayType: 'FLAT' | 'SECTION' | 'CUSTOM';
  formType: 'TRACKER' | 'EVENT';
  hideRegistrationUnit?: boolean;
  hideEnrollmentDate?: boolean;
  hideGeometryField?: boolean;
  hideTrackedEntityTypeAttributes?: boolean;
  disableRegistrationUnit?: boolean;
  disableGeometryField?: boolean;
  disableEnrollmentDate?: boolean;
  disabledIncidentDate?: boolean;
  disableForm?: boolean;
  excludeProgramStages?: boolean;
  excludeInheritedAttributes?: boolean;
  disableEventDate?: boolean;
  hideEventDate?: boolean;
  includedProgramStages?: string[];
  fieldDescriptionLabel?: string;
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
  optionCascadeConfigs?: OptionsPathCascadeConfig[];
  coordinatePickerGeoConfig?: CoordinatePickerGeoConfig;
}
export class ProgramEntryFormConfig implements IProgramEntryFormConfig {
  program!: string;
  programStage?: string;
  displayType: 'FLAT' | 'SECTION' | 'CUSTOM' = 'FLAT';
  formType!: 'TRACKER' | 'EVENT';
  hideRegistrationUnit?: boolean;
  hideEnrollmentDate?: boolean;
  hideIncidentDate?: boolean;
  hideGeometryField?: boolean;
  disableGeometryField?: boolean;
  hideTrackedEntityTypeAttributes?: boolean;
  disableRegistrationUnit?: boolean;
  disableEnrollmentDate?: boolean;
  disabledIncidentDate?: boolean;
  disableEventDate?: boolean;
  disableForm?: boolean;
  hideEventDate?: boolean;
  excludeProgramStages?: boolean;
  excludeInheritedAttributes?: boolean;
  includedProgramStages?: string[];
  submitButtonLabel = 'Submit';
  cancelButtonLabel = 'Cancel';
  fieldDescriptionLabel = 'Description';
  hideActionButtons?: boolean;
  hideSubmitButton?: boolean;
  hideCancelButton?: boolean;
  ignoreRepeatability?: boolean;
  autoAssignedValues?: AutoAssignedValues[];
  hideCustomAssignedFields?: boolean;
  autoComplete?: boolean;
  formFieldExtensions?: FormFieldExtension[];
  updateTeiOrgUnit = false;
  optionCascadeConfigs?: OptionsPathCascadeConfig[];
  coordinatePickerGeoConfig?: CoordinatePickerGeoConfig;

  constructor(config: IProgramEntryFormConfig) {
    Object.assign(this, config);
  }
}
