// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataUrlGenerator, EnrollmentStatus } from '../../../shared';
import { TrackerQueryConfig } from './tracker-query-config.model';

const DEFAULT_FIELDS =
  'createdAt,updatedAt,trackedEntity,trackedEntityType,orgUnit,orgUnitName,attributes[attribute,code,value],enrollments[enrollment,enrolledAt,occurredAt,program,status,orgUnit,storedBy,attributes[attribute,code,createdAt,updatedAt,valueType,value],events[event,occurredAt,dueDate,scheduledAt,status,programStage,program,trackedEntity,enrollment,orgUnit,orgUnitName,assignedUser,storedBy,dataValues]],relationships[relationship,relationshipType,from[trackedEntity[trackedEntity]],to[trackedEntity[trackedEntity]]';

export class TrackerUrlGenerator extends DataUrlGenerator<TrackerUrlGenerator> {
  baseEndpoint = 'tracker/trackedEntities';
  trackedEntity?: string;
  trackedEntityType?: string;
  preferList?: boolean;
  enrollmentStatus?: EnrollmentStatus;
  config?: TrackerQueryConfig;

  constructor(params: Partial<TrackerUrlGenerator>) {
    super(params);
    this.trackedEntityType = params.trackedEntityType;
    this.fields = params.fields ?? DEFAULT_FIELDS;
    this.trackedEntity = params.trackedEntity;
    this.preferList = params.preferList;
    this.enrollmentStatus = params.enrollmentStatus;
    this.config = params.config;
  }

  override generate(): string {
    return this.addPager(
      this.addOrder(
        this.addEnrollmentStatus(
          this.addEnrollmentDates(
            this.addFields(
              this.addOrgUnit(
                this.addFilters(
                  this.addTrackedEntityType(
                    this.addProgram(
                      this.addTrackedEntity(`${this.baseEndpoint}`)
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  override addProgram(url: string): string {
    if (
      !this.program ||
      (this.config?.ignoreProgramForTrackedEntity && this.trackedEntity)
    ) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}program=${this.program}`;
  }

  override addEnrollmentDates(url: string): string {
    if (
      !this.enrollmentEnrolledBefore ||
      (this.config?.ignoreProgramForTrackedEntity && this.trackedEntity)
    ) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}${
        this.enrollmentEnrolledAfter
          ? `enrollmentEnrolledAfter=${this.enrollmentEnrolledAfter}&`
          : ''
      }enrollmentEnrolledBefore=${this.enrollmentEnrolledBefore}`
    );
  }

  addTrackedEntityType(url: string): string {
    if (!this.trackedEntityType || this.program) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}trackedEntityType=${this.trackedEntityType}`
    );
  }

  addEnrollmentStatus(url: string): string {
    if (
      !this.enrollmentStatus ||
      (this.config?.ignoreProgramForTrackedEntity && this.trackedEntity)
    ) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}programStatus=${this.enrollmentStatus}`
    );
  }

  addTrackedEntity(url: string): string {
    if (!this.trackedEntity) {
      return url;
    }

    if (this.trackedEntity.split(';').length === 1 && !this.preferList) {
      return url + `/${this.trackedEntity}`;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}trackedEntity=${this.trackedEntity}`
    );
  }
}
