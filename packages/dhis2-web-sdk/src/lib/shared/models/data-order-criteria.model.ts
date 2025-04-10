// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataOrder, DataOrderFields, IDataOrderCriteria } from '../interfaces';

export class DataOrderCriteria implements IDataOrderCriteria {
  field!: DataOrderFields;
  order: DataOrder = 'asc';

  setField(field: DataOrderFields): DataOrderCriteria {
    this.field = field;
    return this;
  }

  setOrder(order: DataOrder): DataOrderCriteria {
    this.order = order;
    return this;
  }

  getQueryParams() {
    if (!this.order) {
      return `order=${this.field}`;
    }

    return `order=${this.field}:${this.order}`;
  }
}
