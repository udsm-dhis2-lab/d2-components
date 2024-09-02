// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { isArray } from 'lodash';
import { QueryCondition, QueryFilter } from '../models';
export class QueiryFilterUtil {
  static getApiFilters(filters: QueryFilter[]): string | null {
    if (!filters) {
      return null;
    }

    const whereParams = filters
      .map((filter) => {
        switch (filter.condition) {
          case QueryCondition.In: {
            const values = isArray(filter.value)
              ? filter.value
              : [filter.value];
            return `filter=${filter.attribute}:in:[${values.join(',')}]`;
          }

          case QueryCondition.Equal:
            return `filter=${filter.attribute}:eq:${filter.value}`;

          case QueryCondition.Like: {
            const values = isArray(filter.value)
              ? filter.value
              : [filter.value];
            const ilikeFilters = values.map(
              (valueItem) => `filter=${filter.attribute}:like:${valueItem}`
            );

            return ilikeFilters.join('&');
          }

          case QueryCondition.Ilike: {
            const values = isArray(filter.value)
              ? filter.value
              : [filter.value];
            const ilikeFilters = values.map(
              (valueItem) => `filter=${filter.attribute}:ilike:${valueItem}`
            );

            return ilikeFilters.join('&');
          }

          case QueryCondition.LessThan:
            return `filter=${filter.attribute}:lt:${filter.value}`;

          case QueryCondition.LessThanOrEqualTo:
            return `filter=${filter.attribute}:lte:${filter.value}`;
          case QueryCondition.GreaterThan:
            return `filter=${filter.attribute}:gt:${filter.value}`;

          case QueryCondition.GreaterThanOrEqualTo:
            return `filter=${filter.attribute}:gte:${filter.value}`;
          default:
            return null;
        }
      })
      .filter((filter) => filter != null);

    return whereParams?.length > 0 ? whereParams?.join('&') : null;
  }
}
