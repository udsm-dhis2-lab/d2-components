import { IFormMetadataSection, IFormFieldGroup } from '../interfaces';
import { FormFieldGroup } from './form-field-group.model';
import { flatten } from 'lodash';

export class FormMetadataSection implements IFormMetadataSection {
  id!: string;
  name!: string;
  program?: string | undefined;
  sectionStateComplete?: boolean | undefined;
  description?: string | undefined;
  translations?: any;

  constructor(
    private params: {
      section: Partial<IFormMetadataSection>;
      program: Record<string, unknown>;
      locale?: string;
    }
  ) {}

  get attributes() {
    return (
      (this.params.program['programTrackedEntityAttributes'] as Record<
        string,
        unknown
      >[]) || []
    ).map((programTrackedEntityAttribute) => {
      return {
        ...(programTrackedEntityAttribute['trackedEntityAttribute'] as Record<
          string,
          unknown
        >),
        formName: ((programTrackedEntityAttribute[
          'trackedEntityAttribute'
        ] as Record<string, unknown>) || {})['name'],
        sortOrder: programTrackedEntityAttribute['sortOrder'],
        mandatory: programTrackedEntityAttribute['mandatory'],
        allowFutureDate: programTrackedEntityAttribute['allowFutureDate'],
        metaType: 'ATTRIBUTE',
      };
    });
  }

  get dataElements() {
    return flatten(
      (
        (this.params.program['programStages'] as Record<string, unknown>[]) ||
        []
      ).map((programStage) => {
        return (
          (programStage['programStageDataElements'] as Record<
            string,
            unknown
          >[]) || []
        ).map((stageDataElement) => {
          return {
            ...((stageDataElement['dataElement'] as Record<string, unknown>) ||
              {}),
            mandatory: stageDataElement['compulsory'],
            allowFutureDate: stageDataElement['allowFutureDate'],
            stepId: programStage['id'],
            metaType: 'DATA_ELEMENT',
          };
        });
      })
    );
  }

  get fieldGroups(): IFormFieldGroup[] {
    return (this.params.section.fieldGroups || []).map((formFieldGroup) => {
      return new FormFieldGroup({
        formFieldGroup,
        fieldMetaData: [...this.attributes, ...this.dataElements],
        locale: this.params.locale,
      }).toJson();
    });
  }

  toJson(): IFormMetadataSection {
    return {
      id: this.params.section?.id as string,
      name: this.params.section?.name as string,
      fieldGroups: this.fieldGroups,
    };
  }
}
