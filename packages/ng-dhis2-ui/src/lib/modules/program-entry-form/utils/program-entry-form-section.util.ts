/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  Program,
  ProgramSection,
  ProgramTrackedEntityAttribute,
  TrackedEntityAttribute,
} from '@iapps/d2-web-sdk';
import {
  IProgramEntryFormSection,
  ProgramEntryFormConfig,
  ProgramEntryFormSection,
} from '../models';
import { IFormField } from '../../form/interfaces/form-field.interface';
import { FieldDropdown } from '../../form/models/field-dropdown.model';
import { camelCase, isUndefined } from 'lodash';
import { FormField } from '../../form/models/form-field.model';
import { FieldUtil } from '../../form/utils/field.util';
import { FormFieldExtension } from '../../form/interfaces/form-field-extension.interface';
import { CustomFieldConfiguration } from '../../form/interfaces/custom-field-configuration.interface';
import { IEntityFormFieldBase } from '../models/form-field-base.model';
import { ProgramEntryFormFieldUtil } from './program-entry-form-field.util';

// export class ProgramEntryFormSectionUtil {
//   constructor(
//     private program: Program,
//     private config: ProgramEntryFormConfig
//   ) {}

//   get sections(): IProgramEntryFormSection[] {
//     return [];
//   }
// }

export class ProgramEntryFormSectionUtil {
  private readonly fieldUtil: ProgramEntryFormFieldUtil;
  #sortedCanonicalFieldsCache: {
    sourceMap: Map<string, IFormField<string>>;
    sortedFields: IFormField<string>[];
  } | null = null;

  constructor(
    private program: Program,
    private config: ProgramEntryFormConfig,
    private customFieldConfigurations: Record<
      string,
      CustomFieldConfiguration
    > = {}
  ) {
    this.fieldUtil = new ProgramEntryFormFieldUtil(program, config);
  }

  // get programEntryFormSections(): IProgramEntryFormSection[] {
  //   const pteas = this.#getPteas();
  //   if (!pteas.length) return [];

  //   const byAttrId = new Map(
  //     pteas.map(
  //       (programTrackedEntityAttribute: ProgramTrackedEntityAttribute) => [
  //         programTrackedEntityAttribute?.trackedEntityAttribute?.id,
  //         programTrackedEntityAttribute,
  //       ]
  //     )
  //   );
  //   const programSections = this.#getProgramSections();
  //   if (programSections.length) {
  //     return programSections
  //       .map(
  //         (programSection: ProgramSection) =>
  //           new ProgramEntryFormSection({
  //             id: programSection.id,
  //             name: programSection.displayName ?? programSection.name ?? '',
  //             description:
  //               programSection.description ?? programSection.description ?? '',
  //             formFields: this.#mapSectionToFormFields(
  //               programSection,
  //               byAttrId
  //             ),
  //             orientation: 'VERTICAL',
  //           })
  //       )
  //       .filter(
  //         (iProgramEntryFormSection: IProgramEntryFormSection) =>
  //           iProgramEntryFormSection.formFields.length > 0
  //       );
  //   }

  //   return [
  //     new ProgramEntryFormSection({
  //       id: `${this.program.id}_enrollment`,
  //       name: this.program.displayName ?? 'Enrollment',
  //       description: '',
  //       formFields: this.#mapAllPteasToFormFields(pteas),
  //       orientation: 'VERTICAL',
  //     }),
  //   ];
  // }

  get programEntryFormSections(): IProgramEntryFormSection[] {
    if (!this.program) {
      return [];
    }

    const programTrackedEntityAttributes = this.#getPteas();
    if (!programTrackedEntityAttributes.length) {
      return [];
    }

    const sections: IProgramEntryFormSection[] = [];

    const generalDetailsSection = this.fieldUtil.defaultSection;
    if (generalDetailsSection?.formFields?.length) {
      sections.push(generalDetailsSection);
    }

    const programSections = this.#getProgramSections();

    if (programSections.length) {
      const attributesById = new Map<string, ProgramTrackedEntityAttribute>(
        programTrackedEntityAttributes
          .map((programTrackedEntityAttribute) => {
            const trackedEntityAttributeId =
              programTrackedEntityAttribute?.trackedEntityAttribute?.id;

            return trackedEntityAttributeId
              ? ([
                  trackedEntityAttributeId,
                  programTrackedEntityAttribute,
                ] as const)
              : null;
          })
          .filter(
            (
              entry
            ): entry is readonly [string, ProgramTrackedEntityAttribute] =>
              entry !== null
          )
      );

      const canonicalFieldsById = this.#buildCanonicalFieldsById(
        programTrackedEntityAttributes
      );

      for (const programSection of programSections) {
        const sectionFormFields = this.#mapSectionToFormFields(
          programSection,
          attributesById,
          canonicalFieldsById
        );

        if (!sectionFormFields.length) {
          continue;
        }

        sections.push(
          new ProgramEntryFormSection({
            id: programSection.id,
            name: programSection.displayName ?? programSection.name ?? '',
            description: programSection.description ?? '',
            formFields: sectionFormFields,
            orientation: 'VERTICAL',
          })
        );
      }

      return sections;
    }

    const enrollmentFormFields = this.#mapAllPteasToFormFields(
      programTrackedEntityAttributes
    );

    if (enrollmentFormFields.length) {
      sections.push(
        new ProgramEntryFormSection({
          id: `${this.program.id}_enrollment`,
          name: this.program.displayName ?? 'Enrollment',
          description: '',
          formFields: enrollmentFormFields,
          orientation: 'VERTICAL',
        })
      );
    }

    return sections;
  }

  #getProgramSections(): Array<ProgramSection> {
    return (this.program as Program)?.programSections ?? [];
  }

  #getPteas(): Array<ProgramTrackedEntityAttribute> {
    return (this.program as Program)?.programTrackedEntityAttributes ?? [];
  }

  // #mapSectionToFormFields(
  //   section: ProgramSection,
  //   byAttrId: Map<string, any>
  // ): IFormField<string>[] {
  //   const ids: string[] =
  //     section?.trackedEntityAttributes?.map(
  //       (trackedEntityAttribute: TrackedEntityAttribute) =>
  //         trackedEntityAttribute?.id
  //     ) ??
  //     section?.trackedEntityAttributes?.map(
  //       (trackedEntityAttribute: TrackedEntityAttribute) =>
  //         trackedEntityAttribute?.id
  //     ) ??
  //     [];

  //   const fields = (
  //     ids.length
  //       ? ids.map((id: string) => byAttrId.get(id)).filter(Boolean)
  //       : Array.from(byAttrId.values())
  //   )
  //     .map((programTrackedEntityAttribute: ProgramTrackedEntityAttribute) =>
  //       this.#mapPteaToFormField(programTrackedEntityAttribute)
  //     )
  //     .filter((f): f is IFormField<string> => f != null)
  //     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  //   // const extraReportFields = (this as any)?.reportFields ?? [];
  //   // return [...extraReportFields, ...fields];
  //   return [...fields];
  // }

  // #mapSectionToFormFields(
  //   section: ProgramSection,
  //   byAttrId: Map<string, ProgramTrackedEntityAttribute>,
  //   canonicalFieldsById: Map<string, IFormField<string>>
  // ): IFormField<string>[] {
  //   const ids: string[] =
  //     section?.trackedEntityAttributes
  //       ?.map(
  //         (trackedEntityAttribute: TrackedEntityAttribute) =>
  //           trackedEntityAttribute?.id
  //       )
  //       .filter(Boolean as any) ?? [];

  //   if (ids.length) {
  //     const fields = ids
  //       .map((id, index) => {
  //         const canonical = canonicalFieldsById.get(id);
  //         if (!canonical) return null;

  //         // Clone to avoid mutating the canonical instance
  //         return {
  //           ...canonical,
  //           // preserve stable order in the section (optional but recommended)
  //           order: index + 1,
  //         } as IFormField<string>;
  //       })
  //       .filter((f): f is IFormField<string> => f != null);

  //     return fields;
  //   }

  //   // Fallback: no section ids => return all canonical fields
  //   return Array.from(canonicalFieldsById.values()).sort(
  //     (a, b) => (a.order ?? 0) - (b.order ?? 0)
  //   );
  // }

  #mapSectionToFormFields(
    programSection: ProgramSection,
    _unusedAttributeMap: Map<string, ProgramTrackedEntityAttribute>, // intentionally unused
    canonicalFieldsByAttributeId: Map<string, IFormField<string>>
  ): IFormField<string>[] {
    const sectionTrackedEntityAttributes =
      programSection?.trackedEntityAttributes;

    const sectionAttributeCount = sectionTrackedEntityAttributes?.length ?? 0;

    if (sectionAttributeCount > 0) {
      const sectionFields: IFormField<string>[] = [];

      for (let index = 0; index < sectionAttributeCount; index++) {
        const attributeId = sectionTrackedEntityAttributes![index]?.id;
        if (!attributeId) continue;

        const canonicalField = canonicalFieldsByAttributeId.get(attributeId);
        if (!canonicalField) continue;

        sectionFields.push({
          ...canonicalField,
          order: index + 1,
        });
      }

      return sectionFields;
    }

    return this.#getSortedCanonicalFields(canonicalFieldsByAttributeId);
  }

  #getSortedCanonicalFields(
    canonicalFieldsByAttributeId: Map<string, IFormField<string>>
  ): IFormField<string>[] {
    const cache = this.#sortedCanonicalFieldsCache;

    if (cache?.sourceMap === canonicalFieldsByAttributeId) {
      return cache.sortedFields;
    }

    const sortedFields = Array.from(canonicalFieldsByAttributeId.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    this.#sortedCanonicalFieldsCache = {
      sourceMap: canonicalFieldsByAttributeId,
      sortedFields,
    };

    return sortedFields;
  }

  #mapAllPteasToFormFields(
    programTrackedEntityAttribute: ProgramTrackedEntityAttribute[]
  ): IFormField<string>[] {
    const fields = programTrackedEntityAttribute
      .map((programTrackedEntityAttribute: ProgramTrackedEntityAttribute) =>
        this.#mapPteaToFormField(programTrackedEntityAttribute)
      )
      .filter((f): f is IFormField<string> => f != null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // const extraReportFields = (this as any)?.reportFields ?? [];
    // return [...extraReportFields, ...fields];
    return [...fields];
  }

  #mapPteaToFormField(
    programTrackedEntityAttribute: ProgramTrackedEntityAttribute
  ): IFormField<string> | null {
    const tea = programTrackedEntityAttribute?.trackedEntityAttribute;
    if (!tea?.id) return null;

    const iTrackedEntityFormFieldBase: IEntityFormFieldBase = {
      id: tea.id,
      code: tea.code,
      formName: tea.formName,
      name: tea.displayName ?? tea.name,
      mandatory: !!programTrackedEntityAttribute.mandatory,
      valueType: tea.valueType,
      sortOrder: programTrackedEntityAttribute.sortOrder,
      optionSet: tea.optionSet,
    };

    const customConfiguration =
      this.customFieldConfigurations?.[iTrackedEntityFormFieldBase.id];

    const fieldWithCustomConfiguration = {
      ...iTrackedEntityFormFieldBase,
      ...(customConfiguration || {}),
    };

    const options = FieldDropdown.getDropdownOptions(
      fieldWithCustomConfiguration
    );
    const hasOptions = (options?.length ?? 0) > 0;

    const fieldExtension = this.config.formFieldExtensions?.find(
      (formFieldExtension: FormFieldExtension) =>
        formFieldExtension?.id === iTrackedEntityFormFieldBase.id
    );

    const autoAssignedValue = this.#getAutoAssignedValue(
      iTrackedEntityFormFieldBase
    );
    if (
      !isUndefined(autoAssignedValue) &&
      this.config.hideCustomAssignedFields
    ) {
      return null;
    }


    return new FormField<string>({
      id: fieldWithCustomConfiguration.id,
      code: fieldWithCustomConfiguration.code,
      label:
        fieldWithCustomConfiguration.formName ||
        fieldWithCustomConfiguration.name,
      key: fieldWithCustomConfiguration.code
        ? camelCase(fieldWithCustomConfiguration.code)
        : fieldWithCustomConfiguration.id,
      required: fieldWithCustomConfiguration.mandatory,
      type: FieldUtil.getFieldType(fieldWithCustomConfiguration.valueType!),
      options,
      hasOptions,
      disabled:
        this.#getDisabledStatus(iTrackedEntityFormFieldBase) ||
        !!tea.generated,
      order: fieldWithCustomConfiguration.sortOrder,
      controlType: FieldUtil.getFieldControlType(
        fieldWithCustomConfiguration.valueType!,
        hasOptions
      ),
      allowFutureDate: programTrackedEntityAttribute.allowFutureDate === true,
      extension: fieldExtension,
      fieldOptionsDependsOn:
        fieldWithCustomConfiguration.fieldOptionsDependsOn,
      generated: !!tea.generated,
      unique: !!tea.unique,
      pattern: tea.pattern,
      optionSetValue: !!tea.optionSetValue,
    } as any);
  }

  #getAutoAssignedValue(field: IEntityFormFieldBase): unknown {
    const impl = (this as any)?.['#getAutoAssignedValue'];
    return typeof impl === 'function' ? impl.call(this, field) : undefined;
  }

  #getDisabledStatus(field: IEntityFormFieldBase): boolean {
    const impl = (this as any)?.['#getDisabledStatus'];
    return typeof impl === 'function' ? impl.call(this, field) : false;
  }

  #buildCanonicalFieldsById(
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[]
  ): Map<string, IFormField<string>> {
    const fieldsByAttributeId = new Map<string, IFormField<string>>();

    for (let i = 0; i < programTrackedEntityAttributes.length; i++) {
      const programTrackedEntityAttribute = programTrackedEntityAttributes[i];

      const canonicalField = this.#mapPteaToFormField(
        programTrackedEntityAttribute
      );

      if (!canonicalField?.id) continue;

      fieldsByAttributeId.set(canonicalField.id, canonicalField);
    }

    for (const [fieldId, field] of fieldsByAttributeId.entries()) {
      if (!field.fieldOptionsDependsOn) continue;

      const dependentField = fieldsByAttributeId.get(
        field.fieldOptionsDependsOn
      );
      if (!dependentField) continue;

      fieldsByAttributeId.set(
        fieldId,
        new FormField<string>({
          ...field,
          dependentField,
          controlType: 'dropdown',
        })
      );
    }

    return fieldsByAttributeId;
  }
}
