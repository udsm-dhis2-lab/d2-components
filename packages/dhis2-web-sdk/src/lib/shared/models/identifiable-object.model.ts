// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { BaseSDKModel, IBaseSDKModel } from './base.model';

// TODO: Find approach to use class reflection to get field types
export type IdentifiableField =
  | 'id'
  | 'lastUpdated'
  | 'created'
  | 'name'
  | 'displayName'
  | 'shortName'
  | 'code'
  | 'attributeValues';

export const IDENTIFIABLE_FIELDS: IdentifiableField[] = [
  'id',
  'lastUpdated',
  'created',
  'name',
  'displayName',
  'shortName',
  'code',
  'attributeValues',
];

export interface IBaseIdentifiable {
  resourceName: string;
  singularResourceName: string;
  fields: any[];
}

export class BaseIdentifiable extends IBaseSDKModel {
  static resourceName: string;
  static singularResourceName: string;
  static fields: any[];
}

export class IdentifiableObject<
  T extends BaseIdentifiable
> extends BaseSDKModel<T> {
  id!: string;
  lastUpdated!: string;
  created!: string;
  name!: string;
  displayName!: string;
  shortName!: string;
  code?: string;
  attributeValues?: any[];
}
