// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ProgramTrackedEntityAttribute } from './program-tracked-entity-attribute.model';
import { ProgramRuleVariable } from './program-rule-variable.model';
import { ProgramStage } from './program-stage.model';
import { ProgramSection } from './program-section.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';
import { TrackedEntityAttribute } from './tracked-entity-attribute.model';
import { DataElement } from '../../data-element';
import { flatten } from 'lodash';
import { ProgramRule } from './program-rule.model';
import { TrackedEntityType } from './tracked-entity-type.model';

export type ProgramField =
  | IdentifiableField
  | 'programType'
  | 'displayIncidentDate'
  | 'description'
  | 'withoutRegistration'
  | 'ignoreOverdueEvents'
  | 'captureCoordinates'
  | 'featureType'
  | 'enrollmentDateLabel'
  | 'orgUnitLabel'
  | 'onlyEnrollOnce'
  | 'selectIncidentDatesInFuture'
  | 'selectEnrollmentDatesInFuture'
  | 'useFirstStageDuringRegistration'
  | 'incidentDateLabel'
  | 'completeEventsExpiryDays'
  | 'displayFrontPageList'
  | 'trackedEntityType'
  | 'organisationUnits'
  | 'programTrackedEntityAttributes'
  | 'programRuleVariables'
  | 'programStages'
  | 'programSections';

export class Program extends IdentifiableObject<Program> {
  static resourceName = 'programs';
  static singularResourceName = 'program';
  // TODO: Use class reflection
  static fields: ProgramField[] = [
    ...IDENTIFIABLE_FIELDS,
    'programType',
    'displayIncidentDate',
    'description',
    'withoutRegistration',
    'ignoreOverdueEvents',
    'captureCoordinates',
    'featureType',
    'enrollmentDateLabel',
    'orgUnitLabel',
    'onlyEnrollOnce',
    'selectIncidentDatesInFuture',
    'selectEnrollmentDatesInFuture',
    'useFirstStageDuringRegistration',
    'incidentDateLabel',
    'completeEventsExpiryDays',
    'displayFrontPageList',
    'trackedEntityType',
    'organisationUnits',
    'programTrackedEntityAttributes',
  ];

  programType!: string;
  displayIncidentDate?: boolean;
  description?: string;
  withoutRegistration?: boolean;
  ignoreOverdueEvents!: boolean;
  captureCoordinates?: boolean;
  featureType?: string;
  enrollmentDateLabel?: string;
  orgUnitLabel?: string;
  onlyEnrollOnce?: boolean;
  selectIncidentDatesInFuture?: boolean;
  selectEnrollmentDatesInFuture?: boolean;
  useFirstStageDuringRegistration?: boolean;
  incidentDateLabel?: string;
  completeEventsExpiryDays?: number;
  displayFrontPageList?: boolean;
  trackedEntityType?: TrackedEntityType;
  organisationUnits?: object;
  programTrackedEntityAttributes?: ProgramTrackedEntityAttribute[];
  programRuleVariables?: ProgramRuleVariable[];
  programStages?: ProgramStage[];
  programSections?: ProgramSection[];
  programRules?: ProgramRule[];

  constructor(program: Partial<Program>) {
    super(program);
    this.programStages = this.#getProgramStages(program.programStages || []);
    this.programSections = this.#getProgramSections(
      program.programSections || []
    );
    this.programTrackedEntityAttributes =
      this.#getProgramTrackedEntityAttributes(
        program.programTrackedEntityAttributes || []
      );
    this.programRuleVariables = this.#getProgramRuleVariables(
      program.programRuleVariables || []
    );
  }

  get trackedEntityAttributes(): TrackedEntityAttribute[] {
    return (this.programTrackedEntityAttributes || []).map(
      (programTrackedEntityAttribute) => {
        return {
          ...programTrackedEntityAttribute.trackedEntityAttribute,
          allowFutureDate: programTrackedEntityAttribute.allowFutureDate,
        };
      }
    );
  }

  get searchableTrackedEntityAttributes(): TrackedEntityAttribute[] {
    return (this.programTrackedEntityAttributes || [])
      .filter(
        (programTrackedEntityAttribute) =>
          programTrackedEntityAttribute.searchable ||
          programTrackedEntityAttribute?.trackedEntityAttribute?.unique
      )
      .map(
        (programTrackedEntityAttribute) =>
          programTrackedEntityAttribute.trackedEntityAttribute
      )
      .filter((trackedEntityAttribute) => trackedEntityAttribute);
  }

  get reservedTrackedEntityAttributes(): TrackedEntityAttribute[] {
    return (this.programTrackedEntityAttributes || [])
      .filter(
        (programTrackedEntityAttribute) =>
          programTrackedEntityAttribute.trackedEntityAttribute?.generated
      )
      .map(
        (programTrackedEntityAttribute) =>
          programTrackedEntityAttribute.trackedEntityAttribute
      )
      .filter((trackedEntityAttribute) => trackedEntityAttribute);
  }

  get displayInListTrackedEntityAttributes(): TrackedEntityAttribute[] {
    return (this.programTrackedEntityAttributes || [])
      .filter(
        (programTrackedEntityAttribute) =>
          programTrackedEntityAttribute.displayInList
      )
      .map(
        (programTrackedEntityAttribute) =>
          programTrackedEntityAttribute.trackedEntityAttribute
      )
      .filter((trackedEntityAttribute) => trackedEntityAttribute);
  }

  get dataElements(): DataElement[] {
    return flatten(
      (this.programStages || []).map((programStage) => {
        return (programStage.programStageDataElements || [])
          .map((programStageDataElement) => {
            return {
              ...programStageDataElement.dataElement,
              programStageId: programStage.id,
              allowFutureDate: programStageDataElement.allowFutureDate,
              isProgramStageRepeatable: programStage.repeatable,
            };
          })
          .filter((dataElement) => dataElement);
      })
    );
  }

  get displayInListDataElements(): DataElement[] {
    return flatten(
      (this.programStages || []).map((programStage) => {
        return (programStage.programStageDataElements || [])
          .filter(
            (programStageDataElement) =>
              programStageDataElement.displayInReports
          )
          .map((programStageDataElement) => programStageDataElement.dataElement)
          .filter((dataElement) => dataElement);
      })
    );
  }

  #getProgramStages(programStages: Partial<ProgramStage>[]) {
    return (programStages || []).map(
      (programStage) => new ProgramStage(programStage)
    );
  }

  #getProgramSections(programSections: Partial<ProgramSection>[]) {
    return (programSections || []).map(
      (programSection) => new ProgramSection(programSection)
    );
  }

  #getProgramTrackedEntityAttributes(
    programTrackedEntityAttributes: Partial<ProgramTrackedEntityAttribute>[]
  ) {
    return (programTrackedEntityAttributes || []).map(
      (programTrackedEntityAttribute) =>
        new ProgramTrackedEntityAttribute(programTrackedEntityAttribute)
    );
  }

  #getProgramRuleVariables(
    programRuleVariables: Partial<ProgramRuleVariable>[]
  ) {
    return (programRuleVariables || []).map(
      (programRuleVariable) => new ProgramRuleVariable(programRuleVariable)
    );
  }
}
