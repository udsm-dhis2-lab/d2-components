// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { D2Window, Program, ProgramRule } from '@iapps/d2-web-sdk';
import { ProgramEntryFormConfig } from './program-entry-form.config';
import { IFormField, IMetadataRule, MetadataRule } from '../../form';
import { IProgramEntryFormSection } from './program-entry-form-section.model';
import {
  ProgramEntryFormFieldUtil,
  ProgramEntryFormSectionUtil,
} from '../utils';

export interface IProgramEntryFormMetaData {
  id: string;
  name: string;
  description?: string;
  program: Program;
  formFields: IFormField<string>[];
  sections: IProgramEntryFormSection[];
  rules: IMetadataRule[];
}

export class ProgramEntryFormMetaData implements IProgramEntryFormMetaData {
  id!: string;
  name!: string;
  description?: string;

  d2 = (window as unknown as D2Window)?.d2Web;
  config!: ProgramEntryFormConfig;
  program!: Program;

  setConfig(config: ProgramEntryFormConfig): ProgramEntryFormMetaData {
    this.config = config;
    return this;
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

    return new ProgramEntryFormFieldUtil(this.program, this.config).fields;
  }

  get sections(): IProgramEntryFormSection[] {
    if (!this.program || this.config.displayType !== 'SECTION') {
      return [];
    }

    return new ProgramEntryFormSectionUtil(this.program, this.config).sections;
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
      rules: this.rules,
    };
  }

  async get() {
    try {
      const program = await this.#getProgramMetaData();

      if (program) {
        this.program = program;
        return this.toJson();
      }

      return null;
    } catch (err) {
      return null;
    }
  }
}
