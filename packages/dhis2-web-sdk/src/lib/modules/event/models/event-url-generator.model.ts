// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AssignedUserMode } from '../interfaces';
import {
  DataQueryFilter,
  DataUrlGenerator,
  EventStatus,
} from '../../../shared';

const DEFAULT_FIELDS = '';

export class EventUrlGenerator extends DataUrlGenerator<EventUrlGenerator> {
  baseEndpoint = 'tracker/events';
  programStage?: string;
  occurredAfter?: string;
  occurredBefore?: string;
  scheduledAfter?: string;
  scheduledBefore?: string;
  event?: string;
  assignedUserMode?: AssignedUserMode;
  assignedUser?: string;
  attributeFilters?: DataQueryFilter[];
  eventStatus?: EventStatus;

  constructor(params: Partial<EventUrlGenerator>) {
    super(params);
    this.programStage = params.programStage;
    this.event = params.event;
    this.orgUnit = params.orgUnit;
    this.ouMode = params.ouMode || 'SELECTED';
    this.filters = params.filters;
    this.attributeFilters = params.attributeFilters;
    this.fields = params.fields ?? DEFAULT_FIELDS;
    this.assignedUser = params.assignedUser;
    this.assignedUserMode = params.assignedUserMode;
    this.occurredAfter = params.occurredAfter;
    this.occurredBefore = params.occurredBefore;
    this.scheduledAfter = params.scheduledAfter;
    this.scheduledBefore = params.scheduledBefore;
    this.enrollmentEnrolledAfter = params.enrollmentEnrolledAfter;
    this.enrollmentEnrolledBefore = params.enrollmentEnrolledBefore;
    this.eventStatus = params.eventStatus;
  }

  addEvent(url: string): string {
    if (!this.event) {
      return url;
    }

    if (this.event.split(';').length === 1) {
      return url + `/${this.event}`;
    }

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}event=${this.event}`;
  }

  addProgramStage(url: string): string {
    if (!this.programStage) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}programStage=${this.programStage}`
    );
  }

  addEventStatus(url: string): string {
    if (!this.eventStatus) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}status=${this.eventStatus}`;
  }

  addAssignedUserMode(url: string): string {
    if (!this.assignedUserMode) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}assignedUserMode=${this.assignedUserMode}`
    );
  }

  addAssignedUser(url: string): string {
    if (!this.assignedUserMode || this.assignedUserMode !== 'PROVIDED') {
      return url;
    }

    if (!this.assignedUser) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}assignedUser=${this.assignedUser}`
    );
  }

  addOccurredDates(url: string): string {
    if (!this.occurredBefore) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}${
        this.occurredAfter ? `occurredAfter=${this.occurredAfter}&` : ''
      }occurredBefore=${this.occurredBefore}`
    );
  }

  addScheduledDates(url: string): string {
    if (!this.scheduledBefore) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return (
      url +
      `${isThereParams ? '&' : '?'}${
        this.scheduledAfter ? `scheduledAfter=${this.scheduledAfter}&` : ''
      }scheduledBefore=${this.scheduledBefore}`
    );
  }

  addAttributeFilters(url: string): string {
    if (!this.attributeFilters) {
      return url;
    }

    const filterParams = DataQueryFilter.getApiFilters(
      this.attributeFilters,
      'filterAttributes'
    );

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}${filterParams}`;
  }

  generate(): string {
    return this.addPager(
      this.addOrder(
        this.addEventStatus(
          this.addAssignedUser(
            this.addAssignedUserMode(
              this.addEnrollmentDates(
                this.addOccurredDates(
                  this.addScheduledDates(
                    this.addFields(
                      this.addOrgUnit(
                        this.addAttributeFilters(
                          this.addFilters(
                            this.addProgramStage(
                              this.addProgram(
                                this.addEvent(`${this.baseEndpoint}`)
                              )
                            )
                          )
                        )
                      )
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
}
