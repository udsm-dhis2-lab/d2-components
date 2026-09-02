// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { D2Window, Pager, Program, ProgramRule } from '@iapps/d2-web-sdk';
import { CustomFieldConfiguration } from '../../form/interfaces/custom-field-configuration.interface';
import { IFormField } from '../../form/interfaces/form-field.interface';
import {
  IMetadataRule,
  MetadataRule,
} from '../../form/models/form-metadata-rule.model';
import { ProgramEntryFormFieldUtil } from '../utils/program-entry-form-field.util';
import { ProgramEntryFormSectionUtil } from '../utils/program-entry-form-section.util';
import { ProgramStageEntryFormSectionUtil } from '../utils/program-stage-entry-form-section.util';
import { IProgramEntryFormSection } from './program-entry-form-section.model';
import { ProgramEntryFormConfig } from './program-entry-form.config';

export interface IProgramEntryFormMetaData {
  id: string;
  name: string;
  description?: string;
  program: Program;
  formFields: IFormField<string>[];
  sections: IProgramEntryFormSection[];
  programStageSections: IProgramEntryFormSection[];
  rules: IMetadataRule[];
  customFieldConfigurations?: Record<string, CustomFieldConfiguration>;
}

export class ProgramEntryFormMetaData implements IProgramEntryFormMetaData {
  id!: string;
  name!: string;
  description?: string;

  d2 = (window as unknown as D2Window)?.d2Web;
  config!: ProgramEntryFormConfig;
  program!: Program;
  customFieldConfigurations: Record<string, CustomFieldConfiguration> = {};

  private autoAssignedFieldIdSet?: Set<string>;

  setConfig(config: ProgramEntryFormConfig): ProgramEntryFormMetaData {
    this.config = config;
    return this;
  }

  private getFieldIdentifiers(field: IFormField<string>): string[] {
    const f = field as unknown as {
      key?: string;
      code?: string;
      attribute?: string;
      trackedEntityAttribute?: string;
      dataElement?: string;
    };

    const candidateIds: Array<string | undefined> = [
      f.key,
      field.id,
      f.code,
      f.attribute,
      f.trackedEntityAttribute,
      f.dataElement,
    ];

    return candidateIds.filter(
      (value): value is string => typeof value === 'string' && value.length > 0
    );
  }

  private getAutoAssignedFieldIdSet(): Set<string> | null {
    const autoAssigned = this.config?.autoAssignedValues;
    if (!autoAssigned?.length) {
      return null;
    }

    if (!this.autoAssignedFieldIdSet) {
      this.autoAssignedFieldIdSet = new Set(
        autoAssigned
          .map(({ field }) => field)
          .filter(
            (value): value is string =>
              typeof value === 'string' && value.length > 0
          )
      );
    }

    return this.autoAssignedFieldIdSet;
  }

  private shouldDisableField(field: IFormField<string>): boolean {
    if (this.config?.disableForm) {
      return true;
    }

    const fieldIdentifiers = this.getFieldIdentifiers(field);
    if (!fieldIdentifiers.length) {
      return false;
    }

    const autoAssignedIdSet = this.getAutoAssignedFieldIdSet();
    if (!autoAssignedIdSet) {
      return false;
    }

    return fieldIdentifiers.some((id) => autoAssignedIdSet.has(id));
  }

  private withDisabledFlags(field: IFormField<string>): IFormField<string> {
    return {
      ...field,
      disabled: true,
    };
  }

  getProgramPromise() {
    const program = this.config.program;

    const programQuery = this.d2.programModule.program
      .select([
        'id',
        'code',
        'name',
        'description',
        'captureCoordinates',
        'featureType',
        'enrollmentDateLabel',
        'incidentDateLabel',
        'displayIncidentDate',
        'onlyEnrollOnce',
        'orgUnitLabel',
        'programType',
        'useFirstStageDuringRegistration',
        'trackedEntityType',
      ])

      .with(
        this.d2.programModule.trackedEntityType
          .select(['id', 'name'])
          .with(
            this.d2.programModule.trackedEntityTypeAttribute.select([
              'trackedEntityAttribute',
            ])
          ),
        'ToOne'
      )

      .with(this.#getProgramRuleVariableQuery())
      .byId(program as string);

    // if (!this.config.programStage) {
    programQuery.with(this.#getProgramTrackedEntityAttributeQuery());
    // }

    // if (this.config.displayType === 'FLAT') {
    programQuery.with(this.#getProgramSectionQuery());
    // }

    programQuery.with(this.#getProgramStageQuery());

    return programQuery.get({ useIndexDb: true });
  }

  #getProgramRuleVariableQuery() {
    return this.d2.programModule.programRuleVariable
      .with(
        this.d2.dataElementModule.dataElement.select(['id', 'code', 'name']),
        'ToOne'
      )
      .with(
        this.d2.programModule.trackedEntityAttribute.select([
          'id',
          'code',
          'name',
        ]),
        'ToOne'
      );
  }

  #getProgramSectionQuery() {
    return this.d2.programModule.programSection.with(
      this.d2.programModule.trackedEntityAttribute.select(['id'])
    );
  }

  #getProgramTrackedEntityAttributeQuery() {
    return this.d2.programModule.programTrackedEntityAttribute.with(
      this.d2.programModule.trackedEntityAttribute.with(
        this.d2.optionSetModule.optionSet.with(this.d2.optionSetModule.option),
        'ToOne'
      ),
      'ToOne'
    );
  }

  #getProgramStageQuery() {
    return this.d2.programModule.programStage
      .with(this.d2.programModule.programStageSection)
      .with(
        this.d2.programModule.programStageDataElement.with(
          this.d2.dataElementModule.dataElement.with(
            this.d2.optionSetModule.optionSet.with(
              this.d2.optionSetModule.option
            ),
            'ToOne'
          ),
          'ToOne'
        )
      );
  }

  get formFields(): IFormField<string>[] {
    if (!this.program) {
      return [];
    }

    const fields = new ProgramEntryFormFieldUtil(this.program, this.config)
      .fields;

    const autoAssigned = this.config?.autoAssignedValues;
    if (!autoAssigned?.length) {
      return fields;
    }

    return fields.map((field) => {
      return this.shouldDisableField(field)
        ? this.withDisabledFlags(field)
        : field;
    });
  }

  // get sections(): IProgramEntryFormSection[] {
  //   if (!this.program) {
  //     return [];
  //   }

  //   const { displayType, formType } = this.config;

  //   if (!this.program || this.config.displayType !== 'FLAT') {
  //     return [];
  //   }

  //   if (displayType === 'FLAT' && formType === 'TRACKER') {
  //     return new ProgramEntryFormSectionUtil(this.program, this.config)
  //       .programEntryFormSections;
  //   }

  //   return new ProgramEntryFormSectionUtil(this.program, this.config)
  //     .programEntryFormSections;
  // }

  // get programStageSections(): IProgramEntryFormSection[] {
  //   if (!this.program) {
  //     return [];
  //   }

  //   const { displayType, formType } = this.config;

  //   if (displayType === 'FLAT' && formType === 'EVENT') {
  //     return new ProgramStageEntryFormSectionUtil(this.program, this.config)
  //       .programStageEntryFormSections;
  //   }

  //   if (displayType === 'SECTION') {
  //     return new ProgramStageEntryFormSectionUtil(this.program, this.config)
  //       .programStageEntryFormSections;
  //   }

  //   return [];
  // }

  get sections(): IProgramEntryFormSection[] {
    if (!this.program) {
      return [];
    }

    const { displayType } = this.config;

    if (displayType !== 'FLAT') {
      return [];
    }

    const baseSections = new ProgramEntryFormSectionUtil(
      this.program,
      this.config,
      this.customFieldConfigurations
    ).programEntryFormSections;

    const autoAssigned = this.config?.autoAssignedValues;
    if (!autoAssigned?.length) {
      return baseSections;
    }

    return baseSections.map((section) => {
      const formFields = section.formFields ?? [];
      if (!formFields.length) {
        return section;
      }

      let hasDisabledField = false;

      const updatedFields = formFields.map((field) => {
        if (this.shouldDisableField(field)) {
          hasDisabledField = true;
          return this.withDisabledFlags(field);
        }
        return field;
      });

      if (!hasDisabledField) {
        return section;
      }

      return {
        ...section,
        formFields: updatedFields,
      };
    });
  }

  get programStageSections(): IProgramEntryFormSection[] {
    if (!this.program || this.config.excludeProgramStages) {
      return [];
    }

    const { displayType, formType } = this.config;

    const isFlatEvent = displayType === 'FLAT' && formType === 'EVENT';
    const isSectionDisplay = displayType === 'SECTION';

    if (!isFlatEvent && !isSectionDisplay) {
      return [];
    }

    const baseSections = new ProgramStageEntryFormSectionUtil(
      this.program,
      this.config
    ).programStageEntryFormSections;

    const autoAssigned = this.config?.autoAssignedValues;
    if (!autoAssigned?.length) {
      return baseSections;
    }

    return baseSections.map((section) => {
      const formFields = section.formFields ?? [];
      if (!formFields.length) {
        return section;
      }

      let hasDisabledField = false;

      const updatedFields = formFields.map((field) => {
        if (this.shouldDisableField(field)) {
          hasDisabledField = true;
          return this.withDisabledFlags(field);
        }
        return field;
      });

      if (!hasDisabledField) {
        return section;
      }

      return {
        ...section,
        formFields: updatedFields,
      };
    });
  }

  get rules(): IMetadataRule[] {
    if (!this.program || !this.program.programRules) {
      return [];
    }

    return this.program.programRules.map((programRule) =>
      new MetadataRule(
        programRule,
        this.program.programRuleVariables || []
      ).toJson()
    );
  }

  toJson(): IProgramEntryFormMetaData {
    const sections = this.sections;
    const programStageSections = this.programStageSections;

    return {
      id: this.program?.id,
      name: this.program?.name,
      description: this.program?.description,
      program: this.program,
      formFields: this.formFields,
      sections,
      programStageSections,
      rules: this.rules,
      customFieldConfigurations: this.customFieldConfigurations,
    };
  }

  async #getCustomFieldConfigurations(): Promise<
    Record<string, CustomFieldConfiguration>
  > {
    try {
      const response = await this.d2.httpInstance.get(
        'dataStore/field-extensions?fields=id,fieldOptionsDependsOn,optionSet&paging=false',
        { useIndexDb: true }
      );
      const responseData = response?.data;

      const entries = Array.isArray(responseData)
        ? responseData
        : responseData?.['entries'];

      if (!Array.isArray(entries)) {
        return {};
      }

      return entries.reduce(
        (
          fieldConfigurations: Record<string, CustomFieldConfiguration>,
          fieldConfiguration: CustomFieldConfiguration
        ) => {
          if (!fieldConfiguration?.id) {
            return fieldConfigurations;
          }

          return {
            ...fieldConfigurations,
            [fieldConfiguration.id]: fieldConfiguration,
          };
        },
        {}
      );
    } catch {
      return {};
    }
  }

  async get() {
    try {
      const program = await (
        window as unknown as D2Window
      )?.d2Web?.trackerModule?.trackedEntity
        ?.setProgram(this.config?.program)
        ?.getMetaData();

      if (program) {
        this.program = program;

        // TODO FIND ANOTHER WAY TO PASS IN CUSTOM FIELD CONFIGURATIONS, AVOID TIGHT COUPLING HERE
        // this.customFieldConfigurations =
        //   await this.#getCustomFieldConfigurations();

        if (
          this.config?.formFieldExtensions &&
          this.config.formFieldExtensions.length > 0 &&
          this.config.formFieldExtensions[0]?.optionsSourceCode
        ) {
          const orgUnitResponse = await this.d2.httpInstance.get(
            `organisationUnits.json?fields=id,name,code&paging=false&filter=organisationUnitGroups.code:eq:${this.config.formFieldExtensions[0].optionsSourceCode}`
          );
          const orgUnitsResponse = orgUnitResponse?.data?.['organisationUnits'];
          const organisationUnits = Array.isArray(orgUnitsResponse)
            ? orgUnitsResponse
            : [];
          this.config.formFieldExtensions[0].organisationUnits =
            organisationUnits;
        }

        return this.toJson();
      }

      return null;
    } catch (err) {
      return null;
    }
  }
}
