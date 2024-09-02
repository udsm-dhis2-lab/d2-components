// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { QueiryFilterUtil } from './query-filter.util';
import { QueryModel } from '../models';
export class DhisUrlGenerator {
  static generate<T>(query: QueryModel<T>): string {
    if (query == null) {
      return '';
    }

    let url = query.resourceName;
    const fieldParams = query.fields.join(',');

    if (query.id) {
      return `${url}/${query.id}.json?fields=${fieldParams}`;
    }

    const apiFilter =
      query.filters != null
        ? QueiryFilterUtil.getApiFilters(query.filters)
        : null;

    const filterParams = apiFilter
      ? `&${apiFilter}&${
          query.junctionOperator != null
            ? `rootJunction=${query.junctionOperator}&`
            : ''
        }`
      : '';

    return `${url}.json?fields=${fieldParams}${filterParams}&${query.pagination?.getPagingQueryParams()}`;
  }
}
