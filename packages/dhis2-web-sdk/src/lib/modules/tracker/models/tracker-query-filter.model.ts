// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { TrackerFilterCondition } from '../interfaces';
import { ITrackerQueryFilter } from '../interfaces';

export class TrackerQueryFilter implements ITrackerQueryFilter {
  attribute!: string;
  condition!: TrackerFilterCondition;
  value!: string | string[];

  setAttribute(attribute: string): TrackerQueryFilter {
    this.attribute = attribute;
    return this;
  }

  setCondition(condition: TrackerFilterCondition): TrackerQueryFilter {
    this.condition = condition;
    return this;
  }

  setValue(value: string | string[]): TrackerQueryFilter {
    this.value = value;
    return this;
  }

  static getApiFilters(filters: TrackerQueryFilter[]): string {
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
      case TrackerFilterCondition.In:
        return (this.value as string[]).join(';');

      default:
        return this.value;
    }
  }
}
