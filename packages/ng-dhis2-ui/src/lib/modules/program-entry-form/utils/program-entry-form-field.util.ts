// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  DataElement,
  Program,
  ProgramStage,
  TrackedEntityAttribute,
} from '@iapps/d2-web-sdk';
import { ProgramEntryFormConfig } from '../models';
import {
  DateField,
  FieldDropdown,
  FieldUtil,
  FormField,
  FormFieldMetaType,
  IFormField,
} from '../../form';
import { camelCase, flatten, isUndefined } from 'lodash';

export class ProgramEntryFormFieldUtil {
  constructor(
    private program: Program,
    private config: ProgramEntryFormConfig
  ) {}

  get attributes() {
    let programTrackedEntityAttributes =
      this.program.programTrackedEntityAttributes || [];

    if (this.config.excludeInheritedAttributes) {
      programTrackedEntityAttributes = programTrackedEntityAttributes.filter(
        (programTrackedEntityAttribute) => {
          return !(
            this.program.trackedEntityType?.trackedEntityTypeAttributes || []
          ).find(
            (inheritedAttribute) =>
              inheritedAttribute.trackedEntityAttribute?.id ===
              programTrackedEntityAttribute?.trackedEntityAttribute?.id
          );
        }
      );
    }

    return programTrackedEntityAttributes.map(
      (programTrackedEntityAttribute) => {
        return {
          ...programTrackedEntityAttribute.trackedEntityAttribute,
          sortOrder: programTrackedEntityAttribute.sortOrder,
          mandatory: programTrackedEntityAttribute.mandatory,
          allowFutureDate: programTrackedEntityAttribute.allowFutureDate,
          trackedEntityType: this.program.trackedEntityType?.id,
          metaType: 'ATTRIBUTE',
          stepId: null,
        };
      }
    );
  }

  get dataElements() {
    const programStages = this.config.programStage
      ? this.program.programStages?.filter(
          (programStage) => programStage.id === this.config.programStage
        )
      : this.program.programStages;
    return flatten(
      (programStages || []).map((programStage) => {
        const dataElements = (programStage.programStageDataElements || []).map(
          (stageDataElement) => {
            return {
              ...stageDataElement.dataElement,
              sortOrder: stageDataElement.sortOrder,
              mandatory: stageDataElement.compulsory,
              allowFutureDate: stageDataElement.allowFutureDate,
              stepId: programStage.id,
              metaType: 'DATA_ELEMENT',
            };
          }
        );

        const eventDateName =
          programStage.executionDateLabel ||
          `Reporting date - ${programStage.name}`;

        return [
          {
            id: 'occurredAt',
            code: 'OCCURRED_AT',
            formName: eventDateName,
            name: eventDateName,
            shortName: eventDateName,
            displayName: eventDateName,
            sortOrder: 1,
            mandatory: true,
            stepId: programStage.id,
            valueType: 'DATE',
            metaType: 'EVENT_DATE',
            domainType: 'TRACKER',
            aggregationType: 'NONE',
            lastUpdated: '',
            created: '',
          },
          ...dataElements,
        ];
      })
    );
  }

  #getOrgUniField() {
    if (this.config.hideRegistrationUnit) {
      return null;
    }

    return new FormField<string>({
      id: 'orgUnit',
      key: 'orgUnit',
      label: this.program.orgUnitLabel ?? 'Registering unit',
      code: 'orgUnit',
      required: true,
      controlType: 'org-unit',
      disabled: this.config.disableRegistrationUnit,
      isOrgUnit: true,
    });
  }

  #getEnrollmentDateField() {
    if (this.config.hideEnrollmentDate || this.config.programStage) {
      return null;
    }

    return new FormField<string>({
      id: 'enrollmentDate',
      label: this.program.enrollmentDateLabel || 'Enrollment date',
      code: 'enrollmentDate',
      key: 'enrollmentDate',
      required: true,
      type: 'date',
      controlType: 'date',
      disabled: this.config.disableEnrollmentDate,
    });
  }

  #getIncidentDateField() {
    if (!this.program.displayIncidentDate || this.config.programStage) {
      return null;
    }

    return new DateField({
      id: 'incidentDate',
      label: this.program.incidentDateLabel || 'Incident date',
      code: 'incidentDate',
      key: 'incidentDate',
      required: true,
      type: 'date',
      controlType: 'date',
      disabled: this.config.disabledIncidentDate,
    });
  }

  get reportFields() {
    return [
      this.#getOrgUniField(),
      this.#getEnrollmentDateField(),
      this.#getIncidentDateField(),
    ].filter((field) => field != null);
  }

  get fields(): IFormField<string>[] {
    const fields = [...this.attributes, ...this.dataElements]
      .map((field) => {
        const options = FieldDropdown.getDropdownOptions(field);

        const hasOptions = options?.length > 0;

        return new FormField<string>({
          ...field,
          id: field.id,
          code: field.code,
          label: field.formName || field.name,
          key: field.code ? camelCase(field.code) : field.id,
          required: field.mandatory,
          type: FieldUtil.getFieldType(field.valueType),
          options,
          disabled: this.#getDisabledStatus(field),
          order: field.sortOrder,
          hasOptions,
          controlType: FieldUtil.getFieldControlType(
            field.valueType,
            hasOptions
          ),
          metaType: field.metaType as FormFieldMetaType,
          stepId: (field as { stepId: string }).stepId,
        });
      })
      .sort((a, b) => a.order ?? 0 - (b.order ?? 0));

    return [...this.reportFields, ...fields];
  }

  #getDisabledStatus(field: TrackedEntityAttribute | DataElement): boolean {
    if (field?.generated) {
      return true;
    }

    if (
      this.config.autoAssignedValues &&
      this.config.autoAssignedValues.length > 0
    ) {
      const key = field.code ? camelCase(field.code) : field.id;

      const assignedValue = (this.config.autoAssignedValues || []).find(
        (assignedValue) => assignedValue.field === key
      )?.value;

      return !isUndefined(assignedValue);
    }

    return false;
  }
}
