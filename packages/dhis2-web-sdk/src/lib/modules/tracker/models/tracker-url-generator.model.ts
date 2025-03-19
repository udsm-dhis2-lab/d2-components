// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataUrlGenerator, Pager, ProgramDateType } from '../../../shared';

const DEFAULT_FIELDS =
  'createdAt,updatedAt,trackedEntity,trackedEntityType,orgUnit,orgUnitName,attributes,enrollments[enrollment,enrolledAt,occurredAt,program,status,orgUnit,storedBy,events[event,occurredAt,dueDate,scheduledAt,status,programStage,program,trackedEntity,enrollment,orgUnit,orgUnitName,assignedUser,storedBy,dataValues]],relationships[relationship,relationshipType,from[trackedEntity[trackedEntity]],to[trackedEntity[trackedEntity]]';

export class TrackerUrlGenerator extends DataUrlGenerator<TrackerUrlGenerator> {
  baseEndpoint = 'tracker/trackedEntities';
  trackedEntity?: string;
  trackedEntityType?: string;

  constructor(params: Partial<TrackerUrlGenerator>) {
    super(params);
    this.trackedEntityType = params.trackedEntityType;
    this.fields = params.fields ?? DEFAULT_FIELDS;
    this.trackedEntity = params.trackedEntity;
  }

  override generate(): string {
    return this.addPager(
      this.addOrder(
        this.addEnrollmentDates(
          this.addFields(
            this.addOrgUnit(
              this.addFilters(
                this.addTrackedEntityType(
                  this.addProgram(this.addTrackedEntity(`${this.baseEndpoint}`))
                )
              )
            )
          )
        )
      )
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

  addTrackedEntity(url: string): string {
    if (!this.trackedEntity) {
      return url;
    }

    if (this.trackedEntity.split(';').length === 1) {
      return url + `/${this.trackedEntity}`;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}trackedEntity=${this.trackedEntity}`
    );
  }
}
