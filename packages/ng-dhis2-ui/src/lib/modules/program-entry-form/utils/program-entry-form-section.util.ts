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
import { IEntityFormFieldBase } from '../models/form-field-base.model';

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
  constructor(
    private program: Program,
    private config: ProgramEntryFormConfig
  ) {}

  get programEntryFormSections(): IProgramEntryFormSection[] {
    const pteas = this.#getPteas();
    if (!pteas.length) return [];

    const byAttrId = new Map(
      pteas.map(
        (programTrackedEntityAttribute: ProgramTrackedEntityAttribute) => [
          programTrackedEntityAttribute?.trackedEntityAttribute?.id,
          programTrackedEntityAttribute,
        ]
      )
    );

    const programSections = this.#getProgramSections();

    // Prefer explicit program sections (enrollment sections)
    if (programSections.length) {
      return programSections
        .map(
          (programSection: ProgramSection) =>
            new ProgramEntryFormSection({
              id: programSection.id,
              name: programSection.displayName ?? programSection.name ?? '',
              description:
                programSection.description ?? programSection.description ?? '',
              formFields: this.#mapSectionToFormFields(
                programSection,
                byAttrId
              ),
              orientation: 'VERTICAL',
            })
        )
        .filter(
          (iProgramEntryFormSection: IProgramEntryFormSection) =>
            iProgramEntryFormSection.formFields.length > 0
        );
    }

    return [
      new ProgramEntryFormSection({
        id: `${this.program.id}_enrollment`,
        name: this.program.displayName ?? 'Enrollment',
        description: '',
        formFields: this.#mapAllPteasToFormFields(pteas),
        orientation: 'VERTICAL',
      }),
    ];
  }

  #getProgramSections(): Array<ProgramSection> {
    return (this.program as Program)?.programSections ?? [];
  }

  #getPteas(): Array<ProgramTrackedEntityAttribute> {
    return (this.program as Program)?.programTrackedEntityAttributes ?? [];
  }

  #mapSectionToFormFields(
    section: ProgramSection,
    byAttrId: Map<string, any>
  ): IFormField<string>[] {
    const ids: string[] =
      section?.trackedEntityAttributes?.map(
        (trackedEntityAttribute: TrackedEntityAttribute) =>
          trackedEntityAttribute?.id
      ) ??
      section?.trackedEntityAttributes?.map(
        (trackedEntityAttribute: TrackedEntityAttribute) =>
          trackedEntityAttribute?.id
      ) ??
      [];

    const fields = (
      ids.length
        ? ids.map((id: string) => byAttrId.get(id)).filter(Boolean)
        : Array.from(byAttrId.values())
    )
      .map((programTrackedEntityAttribute: ProgramTrackedEntityAttribute) =>
        this.#mapPteaToFormField(programTrackedEntityAttribute)
      )
      .filter((f): f is IFormField<string> => f != null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // const extraReportFields = (this as any)?.reportFields ?? [];
    // return [...extraReportFields, ...fields];
    return [...fields];
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

    const options = FieldDropdown.getDropdownOptions(
      iTrackedEntityFormFieldBase
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
      id: iTrackedEntityFormFieldBase.id,
      code: iTrackedEntityFormFieldBase.code,
      label:
        iTrackedEntityFormFieldBase.formName ||
        iTrackedEntityFormFieldBase.name,
      key: iTrackedEntityFormFieldBase.code
        ? camelCase(iTrackedEntityFormFieldBase.code)
        : iTrackedEntityFormFieldBase.id,
      required: iTrackedEntityFormFieldBase.mandatory,
      type: FieldUtil.getFieldType(iTrackedEntityFormFieldBase.valueType!),
      options,
      hasOptions,
      disabled: this.#getDisabledStatus(iTrackedEntityFormFieldBase),
      order: iTrackedEntityFormFieldBase.sortOrder,
      controlType: FieldUtil.getFieldControlType(
        iTrackedEntityFormFieldBase.valueType!,
        hasOptions
      ),
      extension: fieldExtension,
    });
  }

  #getAutoAssignedValue(field: IEntityFormFieldBase): unknown {
    const impl = (this as any)?.['#getAutoAssignedValue'];
    return typeof impl === 'function' ? impl.call(this, field) : undefined;
  }

  #getDisabledStatus(field: IEntityFormFieldBase): boolean {
    const impl = (this as any)?.['#getDisabledStatus'];
    return typeof impl === 'function' ? impl.call(this, field) : false;
  }
}
