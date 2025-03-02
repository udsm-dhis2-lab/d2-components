// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type UserField = IdentifiableField;

export class User extends IdentifiableObject<User> {
  static resourceName = 'programs';
  static singularResourceName = 'program';
  // TODO: Use class reflection
  static fields: UserField[] = [...IDENTIFIABLE_FIELDS];

  email!: string;
  dataViewOrganisationUnits!: any[];
  organisationUnits!: any[];
  userCredentials: any;
  userGroups!: any[];

  constructor(user: Partial<User>) {
    super(user);
  }
}
