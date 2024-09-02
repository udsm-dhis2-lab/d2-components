// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { BaseSDKModel } from './base.model';
import { QueryCondition } from './query-condition.model';
export class QueryFilter extends BaseSDKModel<QueryFilter> {
  attribute!: string;
  condition!: QueryCondition;
  value: unknown;
}
