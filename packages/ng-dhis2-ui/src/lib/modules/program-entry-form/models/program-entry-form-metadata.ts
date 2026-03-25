// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { D2Window, Pager, Program, ProgramRule } from '@iapps/d2-web-sdk';
import { ProgramEntryFormConfig } from './program-entry-form.config';
import { IProgramEntryFormSection } from './program-entry-form-section.model';
import { IFormField } from '../../form/interfaces/form-field.interface';
import {
  IMetadataRule,
  MetadataRule,
} from '../../form/models/form-metadata-rule.model';
import { ProgramEntryFormFieldUtil } from '../utils/program-entry-form-field.util';
import { ProgramStageEntryFormSectionUtil } from '../utils/program-stage-entry-form-section.util';
import { ProgramEntryFormSectionUtil } from '../utils/program-entry-form-section.util';

export interface IProgramEntryFormMetaData {
  id: string;
  name: string;
  description?: string;
  program: Program;
  formFields: IFormField<string>[];
  sections: IProgramEntryFormSection[];
  programStageSections: IProgramEntryFormSection[];
  rules: IMetadataRule[];
}

export class ProgramEntryFormMetaData implements IProgramEntryFormMetaData {
  id!: string;
  name!: string;
  description?: string;

  d2 = (window as unknown as D2Window)?.d2Web;
  config!: ProgramEntryFormConfig;
  program!: Program;

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

      .with(
        this.d2.programModule.programRuleVariable
          .with(
            this.d2.dataElementModule.dataElement.select([
              'id',
              'code',
              'name',
            ]),
            'ToOne'
          )
          .with(
            this.d2.programModule.trackedEntityAttribute.select([
              'id',
              'code',
              'name',
            ]),
            'ToOne'
          )
      )
      .byId(program as string);

    if (!this.config.programStage) {
      programQuery.with(
        this.d2.programModule.programTrackedEntityAttribute.with(
          this.d2.programModule.trackedEntityAttribute.with(
            this.d2.optionSetModule.optionSet.with(
              this.d2.optionSetModule.option
            ),
            'ToOne'
          ),
          'ToOne'
        )
      );
    }

    if (this.config.displayType === 'FLAT') {
      programQuery.with(
        this.d2.programModule.programSection.with(
          this.d2.programModule.trackedEntityAttribute.select(['id'])
        )
      );
    }

    if (!this.config.excludeProgramStages || this.config.programStage) {
      const programStageQuery = this.d2.programModule.programStage
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

      programQuery.with(programStageQuery);
    }

    return programQuery.get();
  }

  async #getProgramMetaData(): Promise<Program | null> {
    const program = this.config.program;

    if (!this.d2) {
      return null;
    }

    const metaDataResponse = await Promise.all([
      this.getProgramPromise(),
      this.d2.programModule.programRule
        .where({
          attribute: 'program.id' as any,
          value: program as string,
        })
        .with(
          this.d2.programModule.programRuleAction
            .select([
              'id',
              'programRuleActionType',
              'data',
              'programRule',
              'displayContent',
              'content',
            ])
            .with(
              this.d2.dataElementModule.dataElement.select([
                'id',
                'code',
                'name',
              ]),
              'ToOne'
            )
            .with(
              this.d2.programModule.trackedEntityAttribute.select([
                'id',
                'code',
                'name',
              ]),
              'ToOne'
            )
            .with(
              this.d2.optionSetModule.optionGroup
                .select(['id'])
                .with(
                  this.d2.optionSetModule.option.select([
                    'id',
                    'code',
                    'displayName',
                  ]),
                  'ToMany'
                ),
              'ToOne'
            )
            .with(
              this.d2.optionSetModule.option.select([
                'id',
                'code',
                'displayName',
              ]),
              'ToOne'
            )
        )
        .paginate(new Pager({ paging: false }))
        .get(),
    ]);

    const [programResponse, programRuleResponse] = metaDataResponse;

    const metaData = programResponse.data as Program;
    metaData.programRules = programRuleResponse.data as ProgramRule[];

    return metaData;
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

    return fields.map((field) =>
      this.shouldDisableField(field) ? this.withDisabledFlags(field) : field
    );
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
      this.config
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
    if (!this.program) {
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
    return {
      id: this.program?.id,
      name: this.program?.name,
      description: this.program?.description,
      program: this.program,
      formFields: this.formFields,
      sections: this.sections,
      programStageSections: this.programStageSections,
      rules: this.rules,
    };
  }

  async get() {
    try {
      const program = await this.#getProgramMetaData();

      if (program) {
        this.program = program;

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
