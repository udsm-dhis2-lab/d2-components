import { generateUid } from '../../../shared';
import { ITrackedEntityInstance, TrackedEntityInstanceObject } from '../models';
import { EnrollmentUtil } from './enrollment.util';

export class TrackedEntityInstanceUtil {
  static getProgramDateQueryParams(
    date: string,
    dateType: string
  ): string | undefined {
    switch (dateType) {
      case 'START_DATE':
        return date ? `programStartDate=${date}` : undefined;
      case 'END_DATE':
        return date ? `programEndDate=${date}` : undefined;
      default:
        return undefined;
    }
  }

  static getProgramOrgUnitQueryParams(orgUnit: string, ouMode: string): string {
    return orgUnit ? `ou=${orgUnit}&ouMode=${ouMode || 'SELECTED'}` : '';
  }

  static getPagingQueryParams(
    page: number,
    pageSize: number,
    paging: boolean
  ): string {
    if (!paging) {
      return 'paging=false';
    }
    return `page=${page || 1}&pageSize=${
      pageSize || 50
    }&skipPaging=false&totalPages=true`;
  }

  static getAttributeFilterQueryParams(
    attribute: string,
    value: string,
    operator: 'EQ' | 'GT' | 'LT' | 'LIKE' | 'NE'
  ): string | undefined {
    return value ? `filter=${attribute}:${operator}:${value}` : undefined;
  }

  static getFieldsQueryParams(
    attributeFields: string,
    enrollmentFields: string
  ): string {
    return `fields=attributes[${attributeFields}],relationships,enrollments[${enrollmentFields}],orgUnit,trackedEntityInstance`;
  }

  static generate(options: {
    trackedEntity?: string;
    trackedEntityType?: string;
    program?: string;
    orgUnit: string;
  }): Partial<ITrackedEntityInstance> {
    const { trackedEntityType, program, orgUnit, trackedEntity } = options;
    const date = new Date().toISOString();
    const trackedEntityId = trackedEntity ?? generateUid();

    const initialTrackedEntityInstance = {
      orgUnit,
      trackedEntity: trackedEntityId,
      trackedEntityInstance: trackedEntityId,
      trackedEntityType,
      attributes: [],
    };

    if (!program) {
      return initialTrackedEntityInstance;
    }

    return {
      ...initialTrackedEntityInstance,
      enrollments: [
        EnrollmentUtil.generate({
          date,
          program,
          trackedEntity: trackedEntityId,
          trackedEntityType: trackedEntityType as any,
          orgUnit,
        }),
      ],
    };
  }
}
