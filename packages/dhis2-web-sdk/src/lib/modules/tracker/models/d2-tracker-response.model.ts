// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isArray, isPlainObject } from 'lodash';

import { Pager, D2HttpResponseStatus, D2HttpResponse } from '../../../shared';
import {
  ITrackedEntityInstance,
  TrackedEntityInstance,
} from './tracked-entity-instance.model';

export class D2TrackerResponse<T extends TrackedEntityInstance> {
  data?: T | T[];
  pagination?: Pager;
  responseStatus: D2HttpResponseStatus;

  constructor(response: D2HttpResponse, model: ITrackedEntityInstance) {
    this.responseStatus = response.responseStatus;

    if (response.data) {
      this.pagination = this.getPagination(response.data);
      this.data = this.getData(response.data, model);
    }
  }

  getPagination(data: Record<string, unknown>): Pager | undefined {
    if (!data['page']) {
      return undefined;
    }

    return new Pager({
      page: data['page'] as number,
      pageSize: data['pageSize'] as number,
      total: data['total'] as number,
    });
  }

  getData(
    dataResponse: Record<string, unknown>,
    model: ITrackedEntityInstance
  ) {
    const data = dataResponse['instances'] || dataResponse;

    if (isPlainObject(data)) {
      return new (model as any)(data);
    }

    return isArray(data)
      ? data.map((dataItem) => new (model as any)(dataItem))
      : undefined;
  }
}
