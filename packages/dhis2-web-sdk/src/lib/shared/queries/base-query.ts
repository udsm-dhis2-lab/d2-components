// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  BaseIdentifiable,
  D2HttpClient,
  D2Response,
  IBaseIdentifiable,
  JunctionOperator,
  Pager,
  QueryCondition,
  QueryFilter,
  QueryModel,
  RelationshipDirection,
} from '../models';
import { DhisUrlGenerator } from '../utils';

export class BaseQuery<T extends BaseIdentifiable, U> {
  filters: QueryFilter[] = [];
  id?: string;
  fields!: U[];
  resourceName!: string;
  singularResourceName!: string;
  pagination: Pager = new Pager();
  junctionOperator?: JunctionOperator;

  constructor(
    protected identifiable: IBaseIdentifiable,
    protected httpClient: D2HttpClient
  ) {
    this.fields = identifiable.fields;
    this.resourceName = identifiable.resourceName;
    this.singularResourceName = identifiable.singularResourceName;
  }

  select(fields: U[]) {
    this.fields = fields;
    return this;
  }

  paginate(pagination: Pager) {
    this.pagination = pagination;
    return this;
  }

  byId(id: string) {
    this.id = id;
    this.filters = [];
    return this;
  }

  where(params: { attribute: U; value: string }) {
    this.filters = [
      ...this.filters,
      new QueryFilter({
        attribute: params.attribute as string,
        value: params.value as string,
        condition: QueryCondition.Equal,
      }),
    ];

    return this;
  }

  with(
    modelQuery: BaseQuery<any, any>,
    relationshipDirection: RelationshipDirection = 'ToMany'
  ) {
    // TODO: This currently suport one to many, find ways to support man to one
    this.fields = [
      ...this.fields,
      `${
        relationshipDirection === 'ToMany'
          ? modelQuery.resourceName
          : modelQuery.singularResourceName
      }[${modelQuery.fields?.join(',')}]` as any,
    ];
    return this;
  }

  query(): QueryModel<U> {
    return new QueryModel({
      resourceName: this.identifiable.resourceName,
      id: this.id,
      fields: this.fields,
      filters: this.filters,
      pagination: this.pagination,
      junctionOperator: this.junctionOperator,
    });
  }

  dhisUrl(): string {
    return DhisUrlGenerator.generate<U>(this.query());
  }

  async get(): Promise<D2Response<T>> {
    const response = await this.httpClient.get(this.dhisUrl());
    return new D2Response<T>(response, this.identifiable);
  }
}
