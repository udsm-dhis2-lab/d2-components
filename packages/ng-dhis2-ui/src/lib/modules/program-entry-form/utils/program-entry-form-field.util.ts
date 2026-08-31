// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  DataElement,
  Program,
  ProgramStage,
  TrackedEntityAttribute,
} from '@iapps/d2-web-sdk';
import { camelCase, flatten, isUndefined } from 'lodash';
import { ProgramEntryFormConfig } from '../models/program-entry-form.config';
import { FormField } from '../../form/models/form-field.model';
import { DateField } from '../../form/models/date-field.model';
import { IFormField } from '../../form/interfaces/form-field.interface';
import { FieldDropdown } from '../../form/models/field-dropdown.model';
import { FieldUtil } from '../../form/utils/field.util';
import { FormFieldMetaType } from '../../form/interfaces/form-field-meta-type.interface';
import {
  IProgramEntryFormSection,
  ProgramEntryFormSection,
} from '../models/program-entry-form-section.model';

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
            description: eventDateName,
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

  // #getGeometryField(): IFormField<string> | null {
  //   if (this.config?.hideGeometryField) return null;

  //   const effectiveFeatureTypeRaw = this.#resolveEffectiveFeatureType();

  //   const normalizedFeatureType = effectiveFeatureTypeRaw.toUpperCase() as
  //     | 'NONE'
  //     | 'POINT'
  //     | 'POLYGON'
  //     | 'MULTI_POLYGON'
  //     | '';

  //   const supportsGeometry =
  //     normalizedFeatureType === 'POINT' ||
  //     normalizedFeatureType === 'POLYGON' ||
  //     normalizedFeatureType === 'MULTI_POLYGON';

  //   if (!supportsGeometry) return null;

  //   const geometryFieldLabel =
  //     normalizedFeatureType === 'POINT'
  //       ? 'Location (coordinates)'
  //       : 'Boundary (polygon)';

  //   return new FormField<string>({
  //     id: 'geometry',
  //     key: 'geometry',
  //     code: 'geometry',
  //     label: geometryFieldLabel,
  //     controlType: 'coordinate',
  //     required: true,
  //     disabled: this.config?.disableGeometryField ?? false,
  //     isGeometryField: true,
  //   });
  // }

  #getGeometryField(): IFormField<string> | null {
    // Hide by default unless explicitly enabled
    if (this.config?.hideGeometryField !== false) return null;

    const featureType = this.#resolveEffectiveFeatureType().toUpperCase() as
      | 'NONE'
      | 'POINT'
      | 'POLYGON'
      | 'MULTI_POLYGON'
      | '';

    const supportsGeometry =
      featureType === 'POINT' ||
      featureType === 'POLYGON' ||
      featureType === 'MULTI_POLYGON';

    if (!supportsGeometry) return null;

    const label =
      featureType === 'POINT' ? 'Location (coordinates)' : 'Boundary (polygon)';

    return new FormField<string>({
      id: 'geometry',
      key: 'geometry',
      code: 'geometry',
      label,
      controlType: 'coordinate',
      required: true,
      disabled: this.config?.disableGeometryField ?? false,
      isGeometryField: true,
    });
  }

  // #resolveEffectiveFeatureType(): string {
  //   const programMeta = this.program;
  //   const configuredProgramStageId = this.config?.programStage;

  //   if (configuredProgramStageId && programMeta?.programStages?.length) {
  //     const configuredStage = programMeta.programStages.find(
  //       (stage: ProgramStage) => stage?.id === configuredProgramStageId
  //     );

  //     const stageFeatureTypeRaw = configuredStage?.featureType ?? '';
  //     if (stageFeatureTypeRaw) return String(stageFeatureTypeRaw);
  //   }

  //   const programFeatureTypeRaw = (programMeta as Program)?.featureType ?? '';
  //   return String(programFeatureTypeRaw);
  // }

  #resolveEffectiveFeatureType(): string {
    const programMeta = this.program;
    if (!programMeta) return '';

    const configuredStageId = this.config?.programStage;

    if (configuredStageId && Array.isArray(programMeta.programStages)) {
      const stage = programMeta.programStages.find(
        (s: ProgramStage) => s?.id === configuredStageId
      );

      const stageFeatureType = String(stage?.featureType ?? '').trim();

      if (stageFeatureType) {
        return stageFeatureType;
      }
    }

    // 2) Fallback to program (enrollment-level) featureType
    const programFeatureType = String(
      (programMeta as Program)?.featureType ?? ''
    ).trim();

    return programFeatureType;
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

  #getStageIdFromConfig(): string | null {
    const programStageId = (this.config as ProgramEntryFormConfig)
      ?.programStage;

    if (!programStageId) {
      return null;
    }

    const trimmed = programStageId.trim();
    return trimmed ? trimmed : null;
  }

  #findStageById(stageId: string): ProgramStage | null {
    return (
      (this.program.programStages || []).find(
        (stage: ProgramStage) => (stage as ProgramStage)?.id === stageId
      ) ?? null
    );
  }

  #getEventDateField(): IFormField<string> | null {
    if (this.config?.hideEventDate) {
      return null;
    }

    const stageId = this.#getStageIdFromConfig();
    if (!stageId) {
      return null;
    }

    const programStage = this.#findStageById(stageId);
    if (!programStage) {
      return null;
    }

    const eventDateLabel =
      programStage.executionDateLabel ||
      `Reporting date - ${
        programStage.displayName || programStage.name || 'Event'
      }`;

    const todayIso = new Date().toISOString().slice(0, 10);

    return new FormField<string>({
      id: 'occurredAt',
      key: 'occurredAt',
      code: 'OCCURRED_AT',
      label: eventDateLabel,
      required: true,
      controlType: 'date',
      type: 'date',
      value: todayIso,
      disabled: this.config?.disableEventDate ?? false,
      max: todayIso,
      hidden: false,
    });
  }

  get reportFields() {
    return [
      this.#getOrgUniField(),
      this.#getEnrollmentDateField(),
      this.#getIncidentDateField(),
      this.#getGeometryField(),
    ].filter((field) => field != null);
  }

  get eventReportFields(): IFormField<string>[] {
    const fields: Array<IFormField<string> | null> = [
      this.#getOrgUniField(),
      this.#getEventDateField(),
      this.#getGeometryField(),
    ];

    return fields.filter(
      (field): field is IFormField<string> => field !== null
    );
  }

  get defaultSection(): IProgramEntryFormSection {
    const coreFields = this.reportFields.filter(
      (field): field is FormField<string> => !!field
    );

    return new ProgramEntryFormSection({
      id: `${this.program.id}_basic_information`,
      name: 'Basic Information',
      description: '',
      formFields: coreFields,
      orientation: 'VERTICAL',
    });
  }

  get fields(): IFormField<string>[] {
    const fields = [...this.attributes, ...this.dataElements]
      .map((field) => {
        const extension = this.config.formFieldExtensions?.find(
          (fieldExtension) => fieldExtension?.id === field.id
        );

        const options = FieldDropdown.getDropdownOptions(
          field,
          undefined,
          extension
        );

        const hasOptions = options?.length > 0;

        const autoAssignedValue = this.#getAutoAssignedValue(field);

        if (
          !isUndefined(autoAssignedValue) &&
          this.config.hideCustomAssignedFields
        ) {
          return null;
        }

        return new FormField<string>({
          ...field,
          id: field.id,
          code: field.code,
          label: field.formName || field.name,
          description: field.description,
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
          allowFutureDate: (field as { allowFutureDate: boolean })
            .allowFutureDate,
          extension,
        });
      })
      .filter((field) => field != null)
      .sort((a, b) => a.order ?? 0 - (b.order ?? 0));

    return [...this.reportFields, ...fields];
  }

  #getDisabledStatus(field: TrackedEntityAttribute | DataElement): boolean {
    if (field?.generated || this.config.disableForm) {
      return true;
    }

    if (
      this.config.autoAssignedValues &&
      this.config.autoAssignedValues.length > 0
    ) {
      const assignedValue = this.#getAutoAssignedValue(field);

      return !isUndefined(assignedValue);
    }

    return false;
  }

  #getAutoAssignedValue(field: TrackedEntityAttribute | DataElement) {
    const key = field.code ? camelCase(field.code) : field.id;

    const assignedValue = (this.config.autoAssignedValues || []).find(
      (assignedValue) => assignedValue.field === key
    )?.value;

    return assignedValue;
  }
}
