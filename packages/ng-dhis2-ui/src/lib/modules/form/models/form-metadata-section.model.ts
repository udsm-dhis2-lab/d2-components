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
  inheritedAttributes = [];

  constructor(
    private params: {
      section: Partial<IFormMetadataSection>;
      program: Record<string, unknown>;
      locale?: string;
      excludeInheritedAttributes?: boolean;
    }
  ) {
    this.inheritedAttributes =
      ((this.params.program['trackedEntityType'] as any) || {})[
        'trackedEntityTypeAttributes'
      ] || [];
  }

  get attributes() {
    let programTrackedEntityAttributes =
      (this.params.program['programTrackedEntityAttributes'] as Record<
        string,
        unknown
      >[]) || [];

    if (this.params.excludeInheritedAttributes) {
      programTrackedEntityAttributes = programTrackedEntityAttributes.filter(
        (programTrackedEntityAttribute) => {
          return !this.inheritedAttributes.find(
            (inheritedAttribute: any) =>
              inheritedAttribute['trackedEntityAttribute']?.id ===
              (programTrackedEntityAttribute['trackedEntityAttribute'] as any)
                ?.id
          );
        }
      );
    }

    return programTrackedEntityAttributes.map(
      (programTrackedEntityAttribute) => {
        return {
          ...(programTrackedEntityAttribute['trackedEntityAttribute'] as Record<
            string,
            unknown
          >),
          sortOrder: programTrackedEntityAttribute['sortOrder'],
          mandatory: programTrackedEntityAttribute['mandatory'],
          allowFutureDate: programTrackedEntityAttribute['allowFutureDate'],
          trackedEntityType: ((this.params.program[
            'trackedEntityType'
          ] as Record<string, unknown>) || {})['id'],
          metaType: 'ATTRIBUTE',
        };
      }
    );
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
      fieldGroups: this.fieldGroups.filter(
        (fieldGroup) => fieldGroup.fields?.length > 0
      ),
    };
  }
}
