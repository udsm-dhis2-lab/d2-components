// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataFilterCondition } from './data-filter-condition.interface';

export interface IDataQueryFilter {
  attribute: string;
  condition: DataFilterCondition;
  value: unknown;
}
