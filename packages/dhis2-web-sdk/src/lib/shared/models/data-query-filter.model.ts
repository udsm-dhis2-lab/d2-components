// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataFilterCondition, IDataQueryFilter } from '../interfaces';

export type DataQueryAttributeType =
  | 'DATA_ELEMENT'
  | 'TRACKED_ENTITY_ATTRIBUTE';
export class DataQueryFilter implements IDataQueryFilter {
  attribute!: string;
  condition!: DataFilterCondition;
  value!: string | string[];
  attributeType: DataQueryAttributeType = 'TRACKED_ENTITY_ATTRIBUTE';
  programStage!: string;

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

  setType(type: DataQueryAttributeType): DataQueryFilter {
    this.attributeType = type;
    return this;
  }

  setProgramStage(programStage: string): DataQueryFilter {
    this.programStage = programStage;
    return this;
  }
  static getApiFilters(
    filters: DataQueryFilter[],
    filterKey = 'filter'
  ): string {
    return filters
      .map((trackerQueryFilter) => trackerQueryFilter.toApiFilters(filterKey))
      .join('&');
  }

  toApiFilters(filterKey = 'filter'): string {
    return `${filterKey}=${this.attribute}:${
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
