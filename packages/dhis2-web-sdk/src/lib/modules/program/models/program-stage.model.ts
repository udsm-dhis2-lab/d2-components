// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { ProgramStageSection } from './program-stage-section.model';
import { ProgramStageDataElement } from './program-stage-data-element.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramStageField =
  | IdentifiableField
  | 'sortOrder'
  | 'executionDateLabel'
  | 'description'
  | 'formType'
  | 'blockEntryForm'
  | 'hideDueDate'
  | 'repeatable'
  | 'allowGenerateNextVisit'
  | 'minDaysFromStart'
  | 'generatedByEnrollmentDate'
  | 'autoGenerateEvent'
  | 'captureCoordinates'
  | 'featureType'
  | 'dueDateLabel';
export class ProgramStage extends IdentifiableObject<ProgramStage> {
  static resourceName = 'programStages';
  static singularResourceName = 'programStage';
  static fields: ProgramStageField[] = [
    ...IDENTIFIABLE_FIELDS,
    'sortOrder',
    'executionDateLabel',
    'description',
    'formType',
    'blockEntryForm',
    'hideDueDate',
    'repeatable',
    'allowGenerateNextVisit',
    'minDaysFromStart',
    'generatedByEnrollmentDate',
    'autoGenerateEvent',
    'captureCoordinates',
    'featureType',
    'dueDateLabel',
  ];

  sortOrder!: number;
  executionDateLabel?: string;
  description?: string;
  formType!: string;
  blockEntryForm!: boolean;
  hideDueDate!: boolean;
  repeatable!: boolean;
  allowGenerateNextVisit?: boolean;
  minDaysFromStart?: number;
  generatedByEnrollmentDate?: boolean;
  autoGenerateEvent?: boolean;
  captureCoordinates?: boolean;
  featureType?: string;
  dueDateLabel?: string;
  programStageSections?: ProgramStageSection[];
  programStageDataElements?: ProgramStageDataElement[];

  constructor(programStage: Partial<ProgramStage>) {
    super(programStage);
    this.programStageSections = (programStage.programStageSections || []).map(
      (programStageSection) => new ProgramStageSection(programStageSection)
    );

    this.programStageDataElements = (
      programStage.programStageDataElements || []
    ).map(
      (programStageDataElement) =>
        new ProgramStageDataElement(programStageDataElement)
    );
  }
}
