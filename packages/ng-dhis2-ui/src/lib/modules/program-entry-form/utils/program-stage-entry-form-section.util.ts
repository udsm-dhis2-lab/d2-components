/* eslint-disable @typescript-eslint/no-explicit-any */
// // // Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// // // Use of this source code is governed by a BSD-style
// // // license that can be found in the LICENSE file.

// import { camelCase, isUndefined } from 'lodash';
// import { Program, ProgramStage, ProgramStageSection } from '@iapps/d2-web-sdk';
// import {
//   IProgramStageEntryFormSection,
//   ProgramStageEntryFormSection,
// } from '../models/program-stage-entry-form-section.model';
// import { ProgramEntryFormConfig } from '../models/program-entry-form.config';
// import { IFormField } from '../../form/interfaces/form-field.interface';
// import { FieldDropdown } from '../../form/models/field-dropdown.model';
// import { FormField } from '../../form/models/form-field.model';
// import { FieldUtil } from '../../form/utils';
// import { ProgramEntryFormFieldUtil } from './program-entry-form-field.util';

// // import {
// //   IProgramStageEntryFormSection,
// //   ProgramEntryFormConfig,
// //   ProgramStageEntryFormSection,
// // } from '../models';

// // TODO: START - DEPRECATED APPROACH
// // import { Program, ProgramStage, ProgramStageSection } from '@iapps/d2-web-sdk';
// // import {
// //   IProgramStageEntryFormSection,
// //   ProgramEntryFormConfig,
// //   ProgramStageEntryFormSection,
// // } from '../models';

// // export class ProgramStageEntryFormSectionUtil {
// //   constructor(
// //     private program: Program,
// //     private config: ProgramEntryFormConfig
// //   ) {}

// //   // get getProgramStageSections(): IProgramStageEntryFormSection[] {
// //   //   return (this.program.programStages || []).flatMap((stage) =>
// //   //     (stage.programStageSections || []).map(
// //   //       (programStageSection: ProgramStageSection) =>
// //   //         new ProgramStageSection(programStageSection)
// //   //     )
// //   //   );
// //   // }

// //   get programStageEntryFormSections(): IProgramStageEntryFormSection[] {
// //     return (this.program.programStages || []).flatMap((stage: ProgramStage) =>
// //       (stage.programStageSections || []).map(
// //         (section: ProgramStageSection) =>
// //           new ProgramStageEntryFormSection({
// //             id: section.id,
// //             name: section.displayName,
// //             description: '',
// //             formFields: fieldsForSection(stage, section),
// //             orientation: 'HORIZONTAL',
// //           })
// //       )
// //     );
// //   }
// // }
// // TODO: END - DEPRECATED APPROACH

// // export class ProgramStageEntryFormSectionUtil {
// //   constructor(
// //     private program: Program,
// //     private config: ProgramEntryFormConfig
// //   ) {}

// //   get programStageEntryFormSections(): IProgramStageEntryFormSection[] {
// //     const stageId = this.#getStageIdFromConfig();
// //     if (!stageId) return [];

// //     const programStage = this.#findStageById(stageId);
// //     if (!programStage) return [];

// //     return (programStage.programStageSections || []).map(
// //       (section: ProgramStageSection) =>
// //         new ProgramStageEntryFormSection({
// //           id: section.id,
// //           name: section.displayName,
// //           description: section?.description,
// //           formFields: this.#mapSectionToFormFields(programStage, section),
// //           orientation: 'HORIZONTAL',
// //         })
// //     );
// //   }

// //   #getStageIdFromConfig(): string | null {
// //     const programStageRef: any = (this.config as any)?.programStage;
// //     if (!programStageRef) return null;

// //     if (typeof programStageRef === 'string' && programStageRef.trim()) {
// //       return programStageRef.trim();
// //     }

// //     const candidateId =
// //       programStageRef.id ??
// //       programStageRef.stageId ??
// //       programStageRef.programStageId ??
// //       programStageRef.value?.id ??
// //       null;

// //     return typeof candidateId === 'string' && candidateId.trim()
// //       ? candidateId.trim()
// //       : null;
// //   }

// //   #findStageById(stageId: string): ProgramStage | null {
// //     return (
// //       (this.program.programStages || []).find(
// //         (stage: ProgramStage) => (stage as any)?.id === stageId
// //       ) ?? null
// //     );
// //   }

// //   #mapSectionToFormFields(
// //     stage: ProgramStage,
// //     section: ProgramStageSection
// //   ): IFormField<string>[] {
// //     const stageDataElements: any[] =
// //       (stage as any).programStageDataElements || [];

// //     const sectionElementIds: string[] =
// //       (section as any).dataElements?.map((d: { id: string }) => d.id) ??
// //       (section as any).dataElementsIds ??
// //       [];

// //     const relevantStageElements = sectionElementIds.length
// //       ? stageDataElements.filter((pde) =>
// //           sectionElementIds.includes(pde?.dataElement?.id)
// //         )
// //       : stageDataElements;

// //     const mappedFields = relevantStageElements
// //       .map((pde) => this.#mapDataElementToFormField(pde, stage.id))
// //       .filter((field): field is IFormField<string> => field != null)
// //       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

// //     const extraReportFields = (this as any)?.reportFields ?? [];
// //     return [...extraReportFields, ...mappedFields];
// //   }

// //   #mapDataElementToFormField(
// //     pde: any,
// //     stageId: string
// //   ): IFormField<string> | null {
// //     const dataElement = pde?.dataElement;
// //     if (!dataElement?.id) return null;

// //     const baseField = {
// //       id: dataElement.id,
// //       code: dataElement.code,
// //       formName: dataElement.formName,
// //       name: dataElement.displayName,
// //       mandatory: !!pde.compulsory,
// //       valueType: dataElement.valueType,
// //       sortOrder: pde.sortOrder,
// //       stepId: stageId,
// //       optionSet: dataElement.optionSet,
// //     };

// //     const options = FieldDropdown.getDropdownOptions(baseField);
// //     const hasOptions = options?.length > 0;

// //     const fieldExtension = this.config.formFieldExtensions?.find(
// //       (fx: any) => fx?.id === baseField.id
// //     );

// //     const autoAssignedValue = this.#getAutoAssignedValue(baseField);
// //     if (
// //       !isUndefined(autoAssignedValue) &&
// //       this.config.hideCustomAssignedFields
// //     ) {
// //       return null;
// //     }

// //     return new FormField<string>({
// //       ...baseField,
// //       label: baseField.formName || baseField.name,
// //       key: baseField.code ? camelCase(baseField.code) : baseField.id,
// //       required: baseField.mandatory,
// //       type: FieldUtil.getFieldType(baseField.valueType),
// //       options,
// //       disabled: this.#getDisabledStatus(baseField),
// //       order: baseField.sortOrder,
// //       hasOptions,
// //       controlType: FieldUtil.getFieldControlType(
// //         baseField.valueType,
// //         hasOptions
// //       ),
// //       extension: fieldExtension,
// //     });
// //   }

// //   #getAutoAssignedValue(field: any): unknown {
// //     const impl = (this as any)?.['#getAutoAssignedValue'];
// //     return typeof impl === 'function' ? impl.call(this, field) : undefined;
// //   }

// //   #getDisabledStatus(field: any): boolean {
// //     const impl = (this as any)?.['#getDisabledStatus'];
// //     return typeof impl === 'function' ? impl.call(this, field) : false;
// //   }
// // }

// export class ProgramStageEntryFormSectionUtil {
//   private readonly fieldUtil: ProgramEntryFormFieldUtil;

//   constructor(
//     private readonly program: Program,
//     private readonly config: ProgramEntryFormConfig
//   ) {
//     this.fieldUtil = new ProgramEntryFormFieldUtil(program, config);
//   }

//   get programStageEntryFormSections(): IProgramStageEntryFormSection[] {
//     const stageId = this.#getStageIdFromConfig();
//     if (!stageId || !this.program) {
//       return [];
//     }

//     const programStage = this.#findStageById(stageId);
//     if (!programStage) {
//       return [];
//     }

//     const sections: IProgramStageEntryFormSection[] = [];

//     const basicDetailsFields = this.fieldUtil.eventReportFields;
//     if (basicDetailsFields?.length) {
//       sections.push(
//         new ProgramStageEntryFormSection({
//           id: `${programStage.id}_basic_information`,
//           name: 'Basic Information',
//           description: '',
//           formFields: basicDetailsFields,
//           orientation: 'VERTICAL',
//         })
//       );
//     }

//     const stageSections = programStage.programStageSections ?? [];

//     for (const section of stageSections) {
//       const sectionFormFields = this.#mapSectionToFormFields(
//         programStage,
//         section
//       );

//       if (!sectionFormFields.length) {
//         continue;
//       }

//       sections.push(
//         new ProgramStageEntryFormSection({
//           id: section.id,
//           name: section.displayName,
//           description: section?.description,
//           formFields: sectionFormFields,
//           orientation: 'HORIZONTAL',
//         })
//       );
//     }

//     return sections;
//   }

//   #getStageIdFromConfig(): string | null {
//     const programStageRef: any = (this.config as any)?.programStage;
//     if (!programStageRef) return null;

//     if (typeof programStageRef === 'string' && programStageRef.trim()) {
//       return programStageRef.trim();
//     }

//     const candidateId =
//       programStageRef.id ??
//       programStageRef.stageId ??
//       programStageRef.programStageId ??
//       programStageRef.value?.id ??
//       null;

//     return typeof candidateId === 'string' && candidateId.trim()
//       ? candidateId.trim()
//       : null;
//   }

//   #findStageById(stageId: string): ProgramStage | null {
//     return (
//       (this.program.programStages || []).find(
//         (stage: ProgramStage) => (stage as any)?.id === stageId
//       ) ?? null
//     );
//   }

//   #mapSectionToFormFields(
//     stage: ProgramStage,
//     section: ProgramStageSection
//   ): IFormField<string>[] {
//     const stageDataElements: any[] =
//       (stage as any).programStageDataElements || [];

//     const sectionElementIds: string[] =
//       (section as any).dataElements?.map((d: { id: string }) => d.id) ??
//       (section as any).dataElementsIds ??
//       [];

//     const relevantStageElements = sectionElementIds.length
//       ? stageDataElements.filter((pde) =>
//           sectionElementIds.includes(pde?.dataElement?.id)
//         )
//       : stageDataElements;

//     const mappedFields = relevantStageElements
//       .map((pde) => this.#mapDataElementToFormField(pde, stage.id))
//       .filter((field): field is IFormField<string> => field != null)
//       .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

//     return mappedFields;
//   }

//   #mapDataElementToFormField(
//     pde: any,
//     stageId: string
//   ): IFormField<string> | null {
//     const dataElement = pde?.dataElement;
//     if (!dataElement?.id) return null;

//     const baseField = {
//       id: dataElement.id,
//       code: dataElement.code,
//       formName: dataElement.formName,
//       name: dataElement.displayName,
//       mandatory: !!pde.compulsory,
//       valueType: dataElement.valueType,
//       sortOrder: pde.sortOrder,
//       stepId: stageId,
//       optionSet: dataElement.optionSet,
//     };

//     const options = FieldDropdown.getDropdownOptions(baseField);
//     const hasOptions = options?.length > 0;

//     const fieldExtension = this.config.formFieldExtensions?.find(
//       (fx: any) => fx?.id === baseField.id
//     );

//     const autoAssignedValue = this.#getAutoAssignedValue(baseField);
//     if (
//       !isUndefined(autoAssignedValue) &&
//       this.config.hideCustomAssignedFields
//     ) {
//       return null;
//     }

//     return new FormField<string>({
//       ...baseField,
//       label: baseField.formName || baseField.name,
//       key: baseField.code ? camelCase(baseField.code) : baseField.id,
//       required: baseField.mandatory,
//       type: FieldUtil.getFieldType(baseField.valueType),
//       options,
//       disabled: this.#getDisabledStatus(baseField),
//       order: baseField.sortOrder,
//       hasOptions,
//       controlType: FieldUtil.getFieldControlType(
//         baseField.valueType,
//         hasOptions
//       ),
//       extension: fieldExtension,
//     });
//   }

//   #getAutoAssignedValue(field: any): unknown {
//     const impl = (this as any)?.['#getAutoAssignedValue'];
//     return typeof impl === 'function' ? impl.call(this, field) : undefined;
//   }

//   #getDisabledStatus(field: any): boolean {
//     const impl = (this as any)?.['#getDisabledStatus'];
//     return typeof impl === 'function' ? impl.call(this, field) : false;
//   }
// }

import { camelCase, isUndefined } from 'lodash';
import {
  Program,
  ProgramStage,
  ProgramStageDataElement,
  ProgramStageSection,
} from '@iapps/d2-web-sdk';
import {
  IProgramStageEntryFormSection,
  ProgramStageEntryFormSection,
} from '../models/program-stage-entry-form-section.model';
import { ProgramEntryFormConfig } from '../models/program-entry-form.config';
import { IFormField } from '../../form/interfaces/form-field.interface';
import { FieldDropdown } from '../../form/models/field-dropdown.model';
import { FormField } from '../../form/models/form-field.model';
import { FieldUtil } from '../../form/utils';
import { ProgramEntryFormFieldUtil } from './program-entry-form-field.util';

type CanonicalStageFieldsCache = {
  sourceMap: Map<string, IFormField<string>>;
  sortedFields: IFormField<string>[];
};

export class ProgramStageEntryFormSectionUtil {
  private readonly fieldUtil: ProgramEntryFormFieldUtil;

  #sortedCanonicalStageFieldsCache: CanonicalStageFieldsCache | null = null;

  constructor(
    private readonly program: Program,
    private readonly config: ProgramEntryFormConfig
  ) {
    this.fieldUtil = new ProgramEntryFormFieldUtil(program, config);
  }

  get programStageEntryFormSections(): IProgramStageEntryFormSection[] {
    const programStageId = this.#getStageIdFromConfig();
    if (!programStageId) return [];

    const programStage = this.#findStageById(programStageId);
    if (!programStage) return [];

    const sections: IProgramStageEntryFormSection[] = [];

    const basicDetailsFields = this.fieldUtil.eventReportFields;
    if (basicDetailsFields?.length) {
      sections.push(
        new ProgramStageEntryFormSection({
          id: `${programStage.id}_basic_information`,
          name: 'Basic Information',
          description: '',
          formFields: basicDetailsFields,
          orientation: 'VERTICAL',
        })
      );
    }

    const canonicalFieldsByDataElementId =
      this.#buildCanonicalStageFieldsByDataElementId(programStage);

    const programStageSections = programStage.programStageSections ?? [];
    for (const programStageSection of programStageSections) {
      const sectionFields = this.#mapStageSectionToFields(
        programStageSection,
        canonicalFieldsByDataElementId
      );

      if (!sectionFields.length) continue;

      sections.push(
        new ProgramStageEntryFormSection({
          id: programStageSection.id,
          name:
            programStageSection.displayName ?? programStageSection.name ?? '',
          description: programStageSection.description ?? '',
          formFields: sectionFields,
          orientation: 'HORIZONTAL',
        })
      );
    }

    return sections;
  }

  // ---------------------------
  // Canonical stage fields
  // ---------------------------

  #buildCanonicalStageFieldsByDataElementId(
    programStage: ProgramStage
  ): Map<string, IFormField<string>> {
    const programStageDataElements: ProgramStageDataElement[] =
      (programStage as ProgramStage).programStageDataElements ?? [];

    const fieldsByDataElementId = new Map<string, IFormField<string>>();

    for (let i = 0; i < programStageDataElements.length; i++) {
      const programStageDataElement = programStageDataElements[i];

      const canonicalField = this.#mapProgramStageDataElementToField(
        programStageDataElement,
        programStage.id
      );

      if (!canonicalField?.id) continue;

      fieldsByDataElementId.set(canonicalField.id, canonicalField);
    }

    this.#sortedCanonicalStageFieldsCache = null;

    return fieldsByDataElementId;
  }

  // ---------------------------
  // Map a stage section using canonical fields (like program sections)
  // ---------------------------

  #mapStageSectionToFields(
    programStageSection: ProgramStageSection,
    canonicalFieldsByDataElementId: Map<string, IFormField<string>>
  ): IFormField<string>[] {
    const sectionDataElements = (programStageSection as any).dataElements as
      | Array<{ id: string }>
      | undefined;

    const sectionDataElementIdsFromAlt =
      ((programStageSection as any)?.dataElementsIds as string[] | undefined) ??
      undefined;

    const sectionDataElementIds: string[] =
      (sectionDataElements?.length
        ? sectionDataElements.map((d) => d?.id).filter(Boolean)
        : sectionDataElementIdsFromAlt?.filter(Boolean)) ?? [];

    if (sectionDataElementIds.length > 0) {
      const sectionFields: IFormField<string>[] = [];

      for (let index = 0; index < sectionDataElementIds.length; index++) {
        const dataElementId = sectionDataElementIds[index];
        const canonicalField =
          canonicalFieldsByDataElementId.get(dataElementId);

        if (!canonicalField) continue;

        sectionFields.push({
          ...canonicalField,
          order: index + 1,
        });
      }

      return sectionFields;
    }

    return this.#getSortedCanonicalStageFields(canonicalFieldsByDataElementId);
  }

  #getSortedCanonicalStageFields(
    canonicalFieldsByDataElementId: Map<string, IFormField<string>>
  ): IFormField<string>[] {
    const cache = this.#sortedCanonicalStageFieldsCache;
    if (cache?.sourceMap === canonicalFieldsByDataElementId) {
      return cache.sortedFields;
    }

    const sortedFields = Array.from(canonicalFieldsByDataElementId.values());
    sortedFields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    this.#sortedCanonicalStageFieldsCache = {
      sourceMap: canonicalFieldsByDataElementId,
      sortedFields,
    };

    return sortedFields;
  }

  // ---------------------------
  // Map a programStageDataElement => canonical form field
  // ---------------------------

  #mapProgramStageDataElementToField(
    programStageDataElement: ProgramStageDataElement,
    programStageId: string
  ): IFormField<string> | null {
    const dataElementDefinition = programStageDataElement?.dataElement;
    if (!dataElementDefinition?.id) return null;

    const fieldBaseConfig = {
      id: dataElementDefinition.id,
      code: dataElementDefinition.code,
      formName: dataElementDefinition.formName,
      name:
        dataElementDefinition.displayName ?? dataElementDefinition.name ?? '',
      mandatory: !!programStageDataElement.compulsory,
      valueType: dataElementDefinition.valueType,
      sortOrder: programStageDataElement.sortOrder,
      stepId: programStageId,
      optionSet: dataElementDefinition.optionSet,
    };

    const dropdownOptions = FieldDropdown.getDropdownOptions(fieldBaseConfig);

    const hasSelectableOptions = (dropdownOptions?.length ?? 0) > 0;

    const fieldExtension = this.config.formFieldExtensions?.find(
      (extension) => extension?.id === fieldBaseConfig.id
    );

    const autoAssignedValue = this.#getAutoAssignedValue(fieldBaseConfig);

    if (
      !isUndefined(autoAssignedValue) &&
      this.config.hideCustomAssignedFields
    ) {
      return null;
    }

    return new FormField<string>({
      ...fieldBaseConfig,
      label: fieldBaseConfig.formName || fieldBaseConfig.name,
      key: fieldBaseConfig.code
        ? camelCase(fieldBaseConfig.code)
        : fieldBaseConfig.id,
      required: fieldBaseConfig.mandatory,
      type: FieldUtil.getFieldType(fieldBaseConfig.valueType),
      options: dropdownOptions,
      disabled: this.#getDisabledStatus(fieldBaseConfig),
      order: fieldBaseConfig.sortOrder,
      hasOptions: hasSelectableOptions,
      controlType: FieldUtil.getFieldControlType(
        fieldBaseConfig.valueType,
        hasSelectableOptions
      ),
      extension: fieldExtension,
    });
  }

  // ---------------------------
  // Stage selection helpers
  // ---------------------------

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

  #findStageById(programStageId: string): ProgramStage | null {
    return (
      (this.program.programStages ?? []).find(
        (stage: ProgramStage) => (stage as any)?.id === programStageId
      ) ?? null
    );
  }

  // ---------------------------
  // Extension hooks
  // ---------------------------

  #getAutoAssignedValue(field: any): unknown {
    const impl = (this as any)?.['#getAutoAssignedValue'];
    return typeof impl === 'function' ? impl.call(this, field) : undefined;
  }

  #getDisabledStatus(field: any): boolean {
    const impl = (this as any)?.['#getDisabledStatus'];
    return typeof impl === 'function' ? impl.call(this, field) : false;
  }
}
