// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type OrganisationUnitField =
  | IdentifiableField
  | 'level'
  | 'parent'
  | 'publicAccess'
  | 'type'
  | 'path'
  | 'lastUpdated'
  | 'children'
  | 'translations'
  | 'href'
  | 'groups'
  | 'ancestors'
  | 'displayDescription'
  | 'image'
  | 'lastUpdatedBy'
  | 'userGroupAccesses'
  | 'hierarchyLevel'
  | 'attributeValues'
  | 'sharing'
  | 'displayFormName'
  | 'users'
  | 'phoneNumber'
  | 'userAccesses'
  | 'dataSets'
  | 'legendSets'
  | 'programs'
  | 'favorite'
  | 'dimensionItemType'
  | 'favorites'
  | 'aggregationType'
  | 'access'
  | 'contactPerson'
  | 'description'
  | 'displayShortName'
  | 'externalAccess'
  | 'queryMods'
  | 'formName'
  | 'openingDate'
  | 'email'
  | 'address'
  | 'dimensionItem'
  | 'memberCount'
  | 'leaf'
  | 'url'
  | 'closedDate'
  | 'createdBy'
  | 'legendSet'
  | 'comment'
  | 'geometry'
  | 'user';

export class OrganisationUnit extends IdentifiableObject<OrganisationUnit> {
  static resourceName = 'organisationUnits';
  static singularResourceName = 'organisationUnit';

  static fields: OrganisationUnitField[] = [
    ...IDENTIFIABLE_FIELDS,
    'level',
    'parent',
    'publicAccess',
    'type',
    'path',
    'lastUpdated',
    'children',
    'translations',
    'href',
    'groups',
    'ancestors',
    'displayDescription',
    'image',
    'lastUpdatedBy',
    'userGroupAccesses',
    'hierarchyLevel',
    'attributeValues',
    'sharing',
    'displayFormName',
    'users',
    'phoneNumber',
    'userAccesses',
    'dataSets',
    'legendSets',
    'programs',
    'favorite',
    'dimensionItemType',
    'favorites',
    'aggregationType',
    'access',
    'contactPerson',
    'description',
    'displayShortName',
    'externalAccess',
    'queryMods',
    'formName',
    'openingDate',
    'email',
    'address',
    'dimensionItem',
    'memberCount',
    'leaf',
    'url',
    'closedDate',
    'createdBy',
    'legendSet',
    'comment',
    'geometry',
    'user',
  ];

  level!: number;
  parent!: OrganisationUnit;
  ancestors!: OrganisationUnit[];
  children!: OrganisationUnit[];
  openingDate!: Date;
  publicAccess?: string;
  type?: string;
  path?: string;
  translations?: any[];
  uid?: string;
  href?: string;
  groups?: any[];
  displayDescription?: string;
  image?: any;
  lastUpdatedBy?: any;
  userGroupAccesses?: any[];
  hierarchyLevel?: string;
  sharing?: any;
  displayFormName?: string;
  users?: any[];
  phoneNumber?: string;
  userAccesses?: any[];
  dataSets?: any[];
  legendSets?: any[];
  programs?: any[];
  favorite?: boolean;
  dimensionItemType?: any;
  favorites?: any[];
  aggregationType?: any;
  access?: any;
  contactPerson?: string;
  description?: string;
  displayShortName?: string;
  externalAccess?: boolean;
  queryMods?: any;
  formName?: string;
  email?: string;
  address?: string;
  dimensionItem?: string;
  memberCount?: number;
  leaf?: boolean;
  url?: string;
  closedDate?: string;
  createdBy?: any;
  legendSet?: any;
  comment?: string;
  geometry?: any;
  user?: any;

  constructor(organisationUnit: Partial<OrganisationUnit>) {
    super(organisationUnit);
  }
}
