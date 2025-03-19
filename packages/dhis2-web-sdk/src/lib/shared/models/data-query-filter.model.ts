// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataFilterCondition, IDataQueryFilter } from '../interfaces';

export class DataQueryFilter implements IDataQueryFilter {
  attribute!: string;
  condition!: DataFilterCondition;
  value!: string | string[];

  setAttribute(attribute: string): DataQueryFilter {
    this.attribute = attribute;
    return this;
  }

  setCondition(condition: DataFilterCondition): DataQueryFilter {
    this.condition = condition;
    return this;
  }

  setValue(value: string | string[]): DataQueryFilter {
    this.value = value;
    return this;
  }

  static getApiFilters(filters: DataQueryFilter[]): string {
    return filters
      .map((trackerQueryFilter) => trackerQueryFilter.toApiFilters())
      .join('&');
  }

  toApiFilters(): string {
    return `filter=${this.attribute}:${
      this.condition
    }:${this._getApiFilterValue()}`;
  }

  private _getApiFilterValue() {
    switch (this.condition) {
      case DataFilterCondition.In:
        return (this.value as string[]).join(';');

      default:
        return this.value;
    }
  }
}
