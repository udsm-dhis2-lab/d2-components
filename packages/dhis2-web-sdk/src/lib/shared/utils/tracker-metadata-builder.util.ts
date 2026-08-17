import { D2Web, D2Window } from '../../d2-web-sdk';
import { Program, ProgramRule } from '../../modules';
import { D2Response } from '../models';

export class TrackerMetadataBuilder {
  static async getProgram(
    program: string,
    config?: {
      skipProgramRules?: boolean;
    }
  ): Promise<Program | null> {
    try {
      const d2 = (window as unknown as D2Window).d2Web;
      const metaDataResponse = await Promise.all([
        TrackerMetadataBuilder.fetchProgram(program, d2),
        !config?.skipProgramRules
          ? TrackerMetadataBuilder.fetchProgramRules(program, d2)
          : null,
      ]);

      const [programResponse, programRuleResponse] = metaDataResponse;

      const metaData = programResponse.data as Program;
      if (programRuleResponse) {
        metaData.programRules = programRuleResponse.data as ProgramRule[];
      }

      return metaData;
    } catch (error) {
      return null;
    }
  }

  static fetchProgram(
    program: string,
    d2: D2Web
  ): Promise<D2Response<Program>> {
    return d2.programModule.program
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
      .byId(program)
      .with(TrackerMetadataBuilder.getTrackedEntityTypeQuery(d2), 'ToOne')
      .with(TrackerMetadataBuilder.getProgramStageQuery(d2))
      .with(TrackerMetadataBuilder.getProgramSectionQuery(d2))
      .with(TrackerMetadataBuilder.getProgramRuleVariableQuery(d2))
      .with(TrackerMetadataBuilder.getProgramTrackedEntityAttribute(d2))
      .get({ useIndexDb: true });
  }

  static getProgramTrackedEntityAttribute(d2: D2Web) {
    return d2.programModule.programTrackedEntityAttribute.with(
      d2.programModule.trackedEntityAttribute.with(
        d2.optionSetModule.optionSet.with(d2.optionSetModule.option),
        'ToOne'
      ),
      'ToOne'
    );
  }

  static getProgramRuleVariableQuery(d2: D2Web) {
    return d2.programModule.programRuleVariable
      .with(
        d2.dataElementModule.dataElement.select(['id', 'code', 'name']),
        'ToOne'
      )
      .with(
        d2.programModule.trackedEntityAttribute.select(['id', 'code', 'name']),
        'ToOne'
      );
  }

  static getProgramSectionQuery(d2: D2Web) {
    return d2.programModule.programSection.with(
      d2.programModule.trackedEntityAttribute.select(['id'])
    );
  }

  static getProgramStageQuery(d2: D2Web) {
    return d2.programModule.programStage
      .with(d2.programModule.programStageSection)
      .with(
        d2.programModule.programStageDataElement.with(
          d2.dataElementModule.dataElement.with(
            d2.optionSetModule.optionSet.with(d2.optionSetModule.option),
            'ToOne'
          ),
          'ToOne'
        )
      );
  }

  static getTrackedEntityTypeQuery(d2: D2Web) {
    return d2.programModule.trackedEntityType
      .select(['id', 'name'])
      .with(
        d2.programModule.trackedEntityTypeAttribute.select([
          'trackedEntityAttribute',
        ])
      );
  }

  static fetchProgramRules(
    program: string,
    d2: D2Web
  ): Promise<D2Response<ProgramRule>> {
    const programQuery = d2.programModule.programRule
      .where({
        attribute: 'program.id' as any,
        value: program,
      })
      .with(TrackerMetadataBuilder.getProgramRuleActionQuery(d2))
      .get({ useIndexDb: true });

    return programQuery;
  }

  static getProgramRuleActionQuery(d2: D2Web) {
    return d2.programModule.programRuleAction
      .select([
        'id',
        'programRuleActionType',
        'data',
        'displayContent',
        'content',
      ])
      .with(
        d2.dataElementModule.dataElement.select(['id', 'code', 'name']),
        'ToOne'
      )
      .with(
        d2.programModule.trackedEntityAttribute.select(['id', 'code', 'name']),
        'ToOne'
      )
      .with(
        d2.optionSetModule.optionGroup
          .select(['id'])
          .with(
            d2.optionSetModule.option.select(['id', 'code', 'displayName']),
            'ToMany'
          ),
        'ToOne'
      )
      .with(
        d2.optionSetModule.option.select(['id', 'code', 'displayName']),
        'ToOne'
      );
  }
}
