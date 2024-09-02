// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isArray, isPlainObject } from 'lodash';
import { D2HttpResponse, D2HttpResponseStatus } from './http-response.model';
import {
  BaseIdentifiable,
  IBaseIdentifiable,
} from './identifiable-object.model';
import { Pager } from './pager.model';

export class D2Response<T extends BaseIdentifiable> {
  data?: T | T[];
  pagination?: Pager;
  responseStatus: D2HttpResponseStatus;

  constructor(response: D2HttpResponse, model: IBaseIdentifiable) {
    this.responseStatus = response.responseStatus;

    if (response.data) {
      this.pagination = this.getPagination(response.data);
      this.data = this.getData(response.data, model);
    }
  }

  getPagination(data: Record<string, unknown>): Pager | undefined {
    if (!data['pager']) {
      return undefined;
    }

    return new Pager(data['pager']);
  }

  getData(dataResponse: Record<string, unknown>, model: IBaseIdentifiable) {
    const data = dataResponse[model.resourceName];

    if (!data && isPlainObject(dataResponse)) {
      return new (model as any)(dataResponse);
    }

    return isArray(data)
      ? data.map((dataItem) => new (model as any)(dataItem))
      : undefined;
  }
}
