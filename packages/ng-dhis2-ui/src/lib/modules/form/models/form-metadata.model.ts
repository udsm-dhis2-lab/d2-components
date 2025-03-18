import { camelCase, flatten } from 'lodash';

import { FormMetadataSection } from './form-metadata-section.model';
import { IMetadataRule, MetadataRule } from './form-metadata-rule.model';
import { FormField } from './form-field.model';
import { Program, ProgramRule, ProgramRuleVariable } from '@iapps/d2-web-sdk';
import { IFormMetadata, IFormMetadataSection } from '../interfaces';
import { DateField } from './date-field.model';
import { TranslationUtil } from '../utils';

export class FormMetaData implements IFormMetadata {
  id!: string;
  name!: string;
  description?: string | undefined;
  downloadSqlView?: string | undefined;

  constructor(
    private params: {
      programs: Program[];
      locale?: string;
      splitRegistrationSection?: boolean;
      includeAllProgramStages?: boolean;
      programStage?: string;
      customFormMetaData?: Partial<FormMetaData>;
    }
  ) {}

  get sections(): IFormMetadataSection[] {
    const customSections = this.params.customFormMetaData?.sections;

    if (!customSections) {
      return this.#getSectionFromPrograms(this.params.programs);
    }

    return (this.params.customFormMetaData?.sections || [])
      .map((section) => {
        const program = this.params.programs.find(
          (program) => section.program === program['id']
        );

        if (!program) {
          return null;
        }

        return new FormMetadataSection({
          section,
          program,
          locale: this.params.locale,
        }).toJson();
      })
      .filter((section) => section !== null) as IFormMetadataSection[];
  }

  get fields(): FormField<string>[] {
    return flatten(
      flatten(
        this.sections.map((section) =>
          section.fieldGroups.map((fieldGroup) => fieldGroup.fields || [])
        )
      )
    );
  }

  get rules(): IMetadataRule[] {
    let ruleVariables: ProgramRuleVariable[] = [];
    return [
      ...(this.params.customFormMetaData?.rules || []),
      ...(
        flatten(
          this.params.programs.map((program) => {
            ruleVariables = [
              ...ruleVariables,
              ...(program.programRuleVariables as ProgramRuleVariable[]),
            ];
            return program.programRules;
          })
        ) || []
      ).map((rule) =>
        new MetadataRule(rule as ProgramRule, ruleVariables).toJson()
      ),
    ];
  }

  #getSectionFromPrograms(programs: Program[]): IFormMetadataSection[] {
    const sections = flatten(
      programs.map((program) => {
        if (this.params.programStage) {
          return this.#getProgramStageSections(
            program,
            this.params.programStage
          );
        }

        return [
          ...(this.params.splitRegistrationSection
            ? [
                this.#getRegisteringUnitSection(program),
                this.#getReportingDateSection(program),
                this.#getRegistrationSection(program),
              ]
            : [this.#getMergedRegistrationSection(program)]),
          ...this.#getProgramStageSections(program),
        ];
      })
    );

    if (sections.length === 0) {
      return [];
    }

    return sections as IFormMetadataSection[];
  }

  #getProgramStageSections(program: Program, programStageId?: string) {
    const programStages = programStageId
      ? (program.programStages || []).filter(
          (programStage) => programStage.id === programStageId
        )
      : this.params.includeAllProgramStages
      ? program.programStages
      : program.useFirstStageDuringRegistration
      ? [(program.programStages || [])[0]]
      : [];

    return (programStages || []).map((programStage) => {
      return new FormMetadataSection({
        section: {
          id: programStage.id,
          name: programStage.name,
          fieldGroups:
            (programStage.programStageSections || []).length > 0
              ? programStage.programStageSections!.map(
                  (programStageSection) => {
                    return {
                      id: programStageSection.id,
                      name: programStageSection.name,
                      dataKey: camelCase(programStage.code),
                      repeatableStage: programStage.repeatable
                        ? programStage.id
                        : undefined,
                      sortOrder: programStageSection.sortOrder,
                      fields: programStageSection.dataElements as any,
                    };
                  }
                )
              : [
                  {
                    id: programStage.id,
                    dataKey: camelCase(programStage.code),
                    repeatableStage: programStage.repeatable
                      ? programStage.id
                      : undefined,
                    fields: (programStage.programStageDataElements || []).map(
                      (programStageDataElement) => {
                        return {
                          id: programStageDataElement.dataElement?.id,
                        };
                      }
                    ) as any,
                  },
                ],
        },
        program,
        locale: this.params.locale,
      }).toJson();
    });
  }

  #getRegisteringUnitSection(program: Program): IFormMetadataSection {
    return new FormMetadataSection({
      section: {
        id: 'registering_unit_details',
        name: 'Registering unit details',
        fieldGroups: [
          {
            id: 'registering_unit_details',
            sortOrder: 1,
            isFormHorizontal: false,
            fields: [
              new FormField<string>({
                id: 'orgUnit',
                key: 'orgUnit',
                label: program.orgUnitLabel || 'Registering unit',
                code: 'orgUnit',
                required: true,
                controlType: 'org-unit',
              }),
            ],
          },
        ],
      },
      program,
      locale: this.params.locale,
    }).toJson();
  }

  #getReportingDateSection(program: Program): IFormMetadataSection {
    return new FormMetadataSection({
      section: {
        id: 'reporting_dates',
        name: 'Reporting dates',
        fieldGroups: [
          {
            id: 'reporting_dates',
            sortOrder: 1,
            isFormHorizontal: false,
            fields: [
              new DateField({
                id: 'enrollmentDate',
                label: program.enrollmentDateLabel || 'Enrollment date',
                code: 'enrollmentDate',
                key: 'enrollmentDate',
                required: true,
              }),
              program.displayIncidentDate
                ? new DateField({
                    id: 'incidentDate',
                    label: program.incidentDateLabel || 'Incident date',
                    code: 'incidentDate',
                    key: 'incidentDate',
                    required: true,
                  })
                : null,
            ].filter((field) => field) as FormField<string>[],
          },
        ],
      },
      program,
      locale: this.params.locale,
    }).toJson();
  }

  #getRegistrationSection(program: Program): IFormMetadataSection {
    return new FormMetadataSection({
      section: {
        id: 'registration',
        name: 'Registration',
        fieldGroups:
          (program.programSections || []).length > 0
            ? program.programSections!.map((programSection) => {
                return {
                  id: programSection.id,
                  name: programSection.name,
                  sortOrder: programSection.sortOrder,
                  fields: programSection.trackedEntityAttributes as any,
                };
              })
            : [
                {
                  id: 'registration',
                  name: '',
                  sortOrder: 1,
                  fields: (program.programTrackedEntityAttributes || []).map(
                    (programTrackedEntityAttribute) => {
                      return {
                        id: programTrackedEntityAttribute.trackedEntityAttribute
                          ?.id,
                      };
                    }
                  ),
                },
              ],
      },
      program,
      locale: this.params.locale,
    }).toJson();
  }

  #getMergedRegistrationSection(program: Program): IFormMetadataSection {
    return new FormMetadataSection({
      section: {
        id: 'registration',
        name: 'Registration',
        fieldGroups: [
          {
            id: 'registering_unit_details',
            name: 'Registering unit details',
            sortOrder: 1,
            isFormHorizontal: false,
            fields: [
              new FormField<string>({
                id: 'orgUnit',
                key: 'orgUnit',
                label: program.orgUnitLabel || 'Registering unit',
                code: 'orgUnit',
                required: true,
                controlType: 'org-unit',
              }),
            ],
          },
          {
            id: 'reporting_dates',
            name: 'Reporting dates',
            sortOrder: 1,
            isFormHorizontal: false,
            fields: [
              new DateField({
                id: 'enrollmentDate',
                label: program.enrollmentDateLabel || 'Enrollment date',
                code: 'enrollmentDate',
                key: 'enrollmentDate',
                required: true,
              }),
              program.displayIncidentDate
                ? new DateField({
                    id: 'incidentDate',
                    label: program.incidentDateLabel || 'Incident date',
                    code: 'incidentDate',
                    key: 'incidentDate',
                    required: true,
                  })
                : null,
            ].filter((field) => field) as FormField<string>[],
          },
          ...((program.programSections || []).length > 0
            ? program.programSections!.map((programSection) => {
                return {
                  id: programSection.id,
                  name: programSection.name,
                  sortOrder: programSection.sortOrder,
                  fields: programSection.trackedEntityAttributes as any,
                };
              })
            : [
                {
                  id: 'registration',
                  name: 'Registration',
                  sortOrder: 1,
                  fields: (program.programTrackedEntityAttributes || []).map(
                    (programTrackedEntityAttribute) => {
                      return {
                        id: programTrackedEntityAttribute.trackedEntityAttribute
                          ?.id,
                      };
                    }
                  ),
                },
              ]),
        ],
      },
      program,
      locale: this.params.locale,
    }).toJson();
  }

  toJson(): IFormMetadata {
    return {
      id: this.params.customFormMetaData?.id as string,
      name: TranslationUtil.getTranslatedFormName(
        this.params.customFormMetaData || {},
        this.params.locale
      ),
      fields: this.fields,
      sections: this.sections,
      rules: this.rules,
    };
  }
}
