// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Pager } from '../../../shared';
import { TrackerQueryFilter } from './tracker-query-filter.model';

export type ProgramDateType = 'ENROLLED_ON' | 'OCCURED_ON';

export class TrackerUrlGenerator {
  #baseEndpoint = 'tracker/trackedEntities';
  #orgUnit?: string;
  #ouMode: 'ALL' | 'DESCENDANTS' | 'SELECTED' = 'SELECTED';
  #program?: string;
  #trackedEntityType?: string;
  filters?: TrackerQueryFilter[];
  #fields?: string =
    'createdAt,updatedAt,trackedEntity,trackedEntityType,orgUnit,orgUnitName,attributes,enrollments[enrollment,enrolledAt,occurredAt,program,status,orgUnit,storedBy,events[event,occurredAt,dueDate,scheduledAt,status,programStage,program,trackedEntity,enrollment,orgUnit,orgUnitName,assignedUser,storedBy,dataValues]],relationships[relationship,relationshipType,from[trackedEntity[trackedEntity]],to[trackedEntity[trackedEntity]]';
  #enrollmentEnrolledAfter?: string;
  #enrollmentEnrolledBefore?: string;
  #trackedEntity?: string;
  #pager!: Pager;

  constructor(params: {
    program?: string;
    trackedEntityType?: string;
    orgUnit?: string;
    ouMode?: 'ALL' | 'DESCENDANTS' | 'SELECTED';
    filters?: TrackerQueryFilter[];
    fields?: string;
    enrollmentEnrolledAfter?: string;
    enrollmentEnrolledBefore?: string;
    trackedEntity?: string;
    pager?: Pager;
  }) {
    this.#program = params.program;
    this.#trackedEntityType = params.trackedEntityType;
    this.#orgUnit = params.orgUnit;
    this.#ouMode = params.ouMode || this.#ouMode;
    this.filters = params.filters;
    this.#fields = params.fields ?? this.#fields;
    this.#enrollmentEnrolledAfter = params.enrollmentEnrolledAfter;
    this.#enrollmentEnrolledBefore = params.enrollmentEnrolledBefore;
    this.#trackedEntity = params.trackedEntity;
    this.#pager = params.pager || new Pager();
  }

  generate(): string {
    return this.#addPager(
      this.#addOrder(
        this.#addEnrollmentDates(
          this.#addFields(
            this.#addOrgUnit(
              this.#addTrackedEntity(
                this.#addFilters(
                  this.#addTrackedEntityType(
                    this.#addProgram(`${this.#baseEndpoint}`)
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  #addProgram(url: string): string {
    if (!this.#program) {
      return url;
    }

    const isThereParams = this.#isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}program=${this.#program}`;
  }

  #addTrackedEntityType(url: string): string {
    if (!this.#trackedEntityType || this.#program) {
      return url;
    }

    const isThereParams = this.#isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}trackedEntityType=${this.#trackedEntityType}`
    );
  }

  #addFilters(url: string): string {
    if (!this.filters) {
      return url;
    }

    const filterParams = TrackerQueryFilter.getApiFilters(
      this.filters as TrackerQueryFilter[]
    );

    const isThereParams = this.#isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}${filterParams}`;
  }

  #addOrgUnit(url: string): string {
    const isThereParams = this.#isThereQueryParams(url);
    if (!this.#orgUnit) {
      return url + `${isThereParams ? '&' : '?'}ouMode=${this.#ouMode}`;
    }

    return (
      url +
      `${isThereParams ? '&' : '?'}orgUnit=${this.#orgUnit}${
        this.#ouMode ? `&ouMode=${this.#ouMode}` : ''
      }`
    );
  }

  #addFields(url: string): string {
    if (!this.#fields) {
      return url;
    }

    const isThereParams = this.#isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}fields=${this.#fields}`;
  }

  #addTrackedEntity(url: string): string {
    if (!this.#trackedEntity) {
      return url;
    }

    const isThereParams = this.#isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}trackedEntity=${this.#trackedEntity}`
    );
  }

  #addEnrollmentDates(url: string): string {
    if (!this.#enrollmentEnrolledBefore) {
      return url;
    }

    const isThereParams = this.#isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}${
        this.#enrollmentEnrolledAfter
          ? `enrollmentEnrolledAfter=${this.#enrollmentEnrolledAfter}&`
          : ''
      }enrollmentEnrolledBefore=${this.#enrollmentEnrolledBefore}`
    );
  }

  #addOrder(url: string) {
    const isThereParams = this.#isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}order=updatedAt:desc`;
  }

  #addPager(url: string) {
    const isThereParams = this.#isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}${this.#pager.getPagingQueryParams()}`
    );
  }

  #isThereQueryParams(url: string) {
    return (url || '').includes('?');
  }
}
