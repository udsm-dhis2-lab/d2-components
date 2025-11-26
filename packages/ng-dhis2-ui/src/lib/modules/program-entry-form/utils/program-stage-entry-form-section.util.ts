// // Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// // Use of this source code is governed by a BSD-style
// // license that can be found in the LICENSE file.

import { camelCase, isUndefined } from 'lodash';
import { Program, ProgramStage, ProgramStageSection } from '@iapps/d2-web-sdk';
import {
  IProgramStageEntryFormSection,
  ProgramStageEntryFormSection,
} from '../models/program-stage-entry-form-section.model';
import { ProgramEntryFormConfig } from '../models/program-entry-form.config';
import { IFormField } from '../../form/interfaces/form-field.interface';
import { FieldDropdown } from '../../form/models/field-dropdown.model';
import { FormField } from '../../form/models/form-field.model';
import { FieldUtil } from '../../form/utils';
// import {
//   IProgramStageEntryFormSection,
//   ProgramEntryFormConfig,
//   ProgramStageEntryFormSection,
// } from '../models';

// TODO: START - DEPRECATED APPROACH
// import { Program, ProgramStage, ProgramStageSection } from '@iapps/d2-web-sdk';
// import {
//   IProgramStageEntryFormSection,
//   ProgramEntryFormConfig,
//   ProgramStageEntryFormSection,
// } from '../models';

// export class ProgramStageEntryFormSectionUtil {
//   constructor(
//     private program: Program,
//     private config: ProgramEntryFormConfig
//   ) {}

//   // get getProgramStageSections(): IProgramStageEntryFormSection[] {
//   //   return (this.program.programStages || []).flatMap((stage) =>
//   //     (stage.programStageSections || []).map(
//   //       (programStageSection: ProgramStageSection) =>
//   //         new ProgramStageSection(programStageSection)
//   //     )
//   //   );
//   // }

//   get programStageEntryFormSections(): IProgramStageEntryFormSection[] {
//     return (this.program.programStages || []).flatMap((stage: ProgramStage) =>
//       (stage.programStageSections || []).map(
//         (section: ProgramStageSection) =>
//           new ProgramStageEntryFormSection({
//             id: section.id,
//             name: section.displayName,
//             description: '',
//             formFields: fieldsForSection(stage, section),
//             orientation: 'HORIZONTAL',
//           })
//       )
//     );
//   }
// }
// TODO: END - DEPRECATED APPROACH

export class ProgramStageEntryFormSectionUtil {
  constructor(
    private program: Program,
    private config: ProgramEntryFormConfig
  ) {}

  get programStageEntryFormSections(): IProgramStageEntryFormSection[] {
    const stageId = this.#getStageIdFromConfig();
    if (!stageId) return [];

    const programStage = this.#findStageById(stageId);
    if (!programStage) return [];

    return (programStage.programStageSections || []).map(
      (section: ProgramStageSection) =>
        new ProgramStageEntryFormSection({
          id: section.id,
          name: section.displayName,
          description: section?.description,
          formFields: this.#mapSectionToFormFields(programStage, section),
          orientation: 'HORIZONTAL',
        })
    );
  }

  #getStageIdFromConfig(): string | null {
    const programStageRef: any = (this.config as any)?.programStage;
    if (!programStageRef) return null;

    if (typeof programStageRef === 'string' && programStageRef.trim()) {
      return programStageRef.trim();
    }

    const candidateId =
      programStageRef.id ??
      programStageRef.stageId ??
      programStageRef.programStageId ??
      programStageRef.value?.id ??
      null;

    return typeof candidateId === 'string' && candidateId.trim()
      ? candidateId.trim()
      : null;
  }

  #findStageById(stageId: string): ProgramStage | null {
    return (
      (this.program.programStages || []).find(
        (stage: ProgramStage) => (stage as any)?.id === stageId
      ) ?? null
    );
  }

  #mapSectionToFormFields(
    stage: ProgramStage,
    section: ProgramStageSection
  ): IFormField<string>[] {
    const stageDataElements: any[] =
      (stage as any).programStageDataElements || [];

    const sectionElementIds: string[] =
      (section as any).dataElements?.map((d: { id: string }) => d.id) ??
      (section as any).dataElementsIds ??
      [];

    const relevantStageElements = sectionElementIds.length
      ? stageDataElements.filter((pde) =>
          sectionElementIds.includes(pde?.dataElement?.id)
        )
      : stageDataElements;

    const mappedFields = relevantStageElements
      .map((pde) => this.#mapDataElementToFormField(pde, stage.id))
      .filter((field): field is IFormField<string> => field != null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const extraReportFields = (this as any)?.reportFields ?? [];
    return [...extraReportFields, ...mappedFields];
  }

  #mapDataElementToFormField(
    pde: any,
    stageId: string
  ): IFormField<string> | null {
    const dataElement = pde?.dataElement;
    if (!dataElement?.id) return null;

    const baseField = {
      id: dataElement.id,
      code: dataElement.code,
      formName: dataElement.formName,
      name: dataElement.displayName,
      mandatory: !!pde.compulsory,
      valueType: dataElement.valueType,
      sortOrder: pde.sortOrder,
      stepId: stageId,
      optionSet: dataElement.optionSet,
    };

    const options = FieldDropdown.getDropdownOptions(baseField);
    const hasOptions = options?.length > 0;

    const fieldExtension = this.config.formFieldExtensions?.find(
      (fx: any) => fx?.id === baseField.id
    );

    const autoAssignedValue = this.#getAutoAssignedValue(baseField);
    if (
      !isUndefined(autoAssignedValue) &&
      this.config.hideCustomAssignedFields
    ) {
      return null;
    }

    return new FormField<string>({
      ...baseField,
      label: baseField.formName || baseField.name,
      key: baseField.code ? camelCase(baseField.code) : baseField.id,
      required: baseField.mandatory,
      type: FieldUtil.getFieldType(baseField.valueType),
      options,
      disabled: this.#getDisabledStatus(baseField),
      order: baseField.sortOrder,
      hasOptions,
      controlType: FieldUtil.getFieldControlType(
        baseField.valueType,
        hasOptions
      ),
      extension: fieldExtension,
    });
  }

  #getAutoAssignedValue(field: any): unknown {
    const impl = (this as any)?.['#getAutoAssignedValue'];
    return typeof impl === 'function' ? impl.call(this, field) : undefined;
  }

  #getDisabledStatus(field: any): boolean {
    const impl = (this as any)?.['#getDisabledStatus'];
    return typeof impl === 'function' ? impl.call(this, field) : false;
  }
}
