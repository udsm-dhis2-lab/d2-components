import { generateUid } from '@iapps/d2-web-sdk';
import { Enrollment, IEnrollment } from '../models';

export class EnrollmentUtil {
  static getEnrollments(
    enrollmentResponse: Record<string, any>[],
    params: { program: string; trackedEntityType: string }
  ): IEnrollment[] {
    const enrollments = (enrollmentResponse || []).map((enrollment) => {
      if (params.program) {
        enrollment['program'] = params.program;
      }

      if (params.trackedEntityType) {
        enrollment['trackedEntityType'] = params.trackedEntityType;
      }

      return new Enrollment(enrollment);
    });

    return EnrollmentUtil.sortEnrollments(enrollments as any);
  }
  static sortEnrollments(
    enrollments: IEnrollment[],
    sortOrder: 'DESC' | 'ASC' = 'DESC'
  ): IEnrollment[] {
    return (enrollments || []).sort((a: any, b: any) => {
      const dateA: any = new Date(a?.enrollmentDate || a?.enrollmentAt);
      const dateB: any = new Date(b?.enrollmentDate || b?.enrollmentAt);

      switch (sortOrder) {
        case 'DESC':
          return dateB - dateA;
        case 'ASC':
        default:
          return dateA - dateB;
      }
    });
  }

  static getLatestEnrollment(
    enrollments: IEnrollment[],
    skipSorting = true
  ): IEnrollment {
    return ((skipSorting
      ? enrollments
      : EnrollmentUtil.sortEnrollments(enrollments)) || [])[0];
  }

  static setEnrollmentOrgUnit(
    enrollment: IEnrollment,
    orgUnit: string
  ): IEnrollment {
    return {
      ...enrollment,
      orgUnit,
      orgUnitName: '',
    };
  }

  static generate(options: {
    date: string;
    program: string;
    trackedEntity: string;
    trackedEntityType: string;
    orgUnit: string;
  }): IEnrollment {
    const { date, program, trackedEntity, trackedEntityType, orgUnit } =
      options;
    return {
      enrolledAt: date,
      occurredAt: date,
      createdAtClient: date,
      program,
      lastUpdated: date,
      orgUnit,
      trackedEntity,
      enrollment: generateUid(),
      trackedEntityType,
      events: [],
    };
  }
}
