// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { BaseSDKModel } from './base.model';
import { QueryFilter } from './query-filter.model';
import { Pager } from './pager.model';

export class QueryModel<U> extends BaseSDKModel<QueryModel<U>> {
  resourceName!: string;
  id?: string;
  fields!: U[];
  filters?: QueryFilter[];
  pagination?: Pager;
  relations: any;
  junctionOperator?: 'AND' | 'OR';
}
