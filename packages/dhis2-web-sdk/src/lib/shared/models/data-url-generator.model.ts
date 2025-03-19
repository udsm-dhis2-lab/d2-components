// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataQueryFilter } from './data-query-filter.model';
import { OuMode } from '../interfaces';
import { Pager } from './pager.model';

export abstract class DataUrlGenerator<T extends DataUrlGenerator<T>> {
  abstract baseEndpoint: string;
  fields!: string;
  orgUnit?: string;
  ouMode: OuMode;
  program?: string;
  filters?: DataQueryFilter[];
  enrollmentEnrolledAfter?: string;
  enrollmentEnrolledBefore?: string;
  pager!: Pager;

  constructor(params: Partial<T>) {
    this.program = params.program;
    this.orgUnit = params.orgUnit;
    this.ouMode = params.ouMode || 'SELECTED';
    this.filters = params.filters;
    this.enrollmentEnrolledAfter = params.enrollmentEnrolledAfter;
    this.enrollmentEnrolledBefore = params.enrollmentEnrolledBefore;
    this.pager = params.pager || new Pager();
  }

  abstract generate(): string;

  addProgram(url: string): string {
    if (!this.program) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}program=${this.program}`;
  }

  addFilters(url: string): string {
    if (!this.filters) {
      return url;
    }

    const filterParams = DataQueryFilter.getApiFilters(
      this.filters as DataQueryFilter[]
    );

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}${filterParams}`;
  }

  addOrgUnit(url: string): string {
    const isThereParams = this.isThereQueryParams(url);
    if (!this.orgUnit) {
      return url + `${isThereParams ? '&' : '?'}ouMode=${this.ouMode}`;
    }

    return (
      url +
      `${isThereParams ? '&' : '?'}orgUnit=${this.orgUnit}${
        this.ouMode ? `&ouMode=${this.ouMode}` : ''
      }`
    );
  }

  addFields(url: string): string {
    if (!this.fields) {
      return url;
    }

    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}fields=${this.fields}`;
  }

  addEnrollmentDates(url: string): string {
    if (!this.enrollmentEnrolledBefore) {
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

  addOrder(url: string) {
    const isThereParams = this.isThereQueryParams(url);

    return url + `${isThereParams ? '&' : '?'}order=updatedAt:desc`;
  }

  addPager(url: string) {
    const isThereParams = this.isThereQueryParams(url);

    return (
      url + `${isThereParams ? '&' : '?'}${this.pager.getPagingQueryParams()}`
    );
  }

  isThereQueryParams(url: string) {
    return (url || '').includes('?');
  }
}
