// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isArray, isPlainObject } from 'lodash';

import { D2HttpResponse, D2HttpResponseStatus, Pager } from '../../../shared';
import { DHIS2Event, IDHIS2Event } from './event.model';

export class D2EventResponse<T extends DHIS2Event> {
  data?: T | T[];
  pagination?: Pager;
  responseStatus: D2HttpResponseStatus;

  constructor(response: D2HttpResponse, model: IDHIS2Event) {
    this.responseStatus = response.responseStatus;

    if (response.data) {
      this.pagination = this.#getPagination(response.data);
      this.data = this.#getData(response.data, model);
    }
  }

  #getPagination(data: Record<string, unknown>): Pager | undefined {
    if (!data['page']) {
      return undefined;
    }

    return new Pager({
      page: data['page'] as number,
      pageSize: data['pageSize'] as number,
      total: data['total'] as number,
      pageCount: data['pageCount'] as number,
    });
  }

  #getData(dataResponse: Record<string, unknown>, model: IDHIS2Event) {
    const data = dataResponse['events'] ||  dataResponse['instances'] || dataResponse;

    if (isPlainObject(data)) {
      return new (model as any)(data);
    }

    return isArray(data)
      ? data.map((dataItem) => new (model as any)(dataItem))
      : undefined;
  }
}
