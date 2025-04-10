// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataOrder } from './data-order.interface';
import { DataOrderFields } from './data-order-field.interface';

export interface IDataOrderCriteria {
  field: DataOrderFields;
  order: DataOrder;
}
