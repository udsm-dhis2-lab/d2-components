// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type OrganisationUnitGroupField =
  | IdentifiableField
  | 'favorites'
  | 'symbol'
  | 'aggregationType'
  | 'access'
  | 'color'
  | 'publicAccess'
  | 'description'
  | 'displayShortName'
  | 'externalAccess'
  | 'queryMods'
  | 'translations'
  | 'formName'
  | 'featureType'
  | 'members'
  | 'href'
  | 'displayDescription'
  | 'lastUpdatedBy'
  | 'userGroupAccesses'
  | 'dimensionItem'
  | 'attributeValues'
  | 'groupSets'
  | 'sharing'
  | 'displayFormName'
  | 'createdBy'
  | 'userAccesses'
  | 'legendSet'
  | 'legendSets'
  | 'geometry'
  | 'user'
  | 'favorite'
  | 'dimensionItemType';

export class OrganisationUnitGroup extends IdentifiableObject<OrganisationUnitGroup> {
  static resourceName = 'organisationUnitGroups';
  static singularResourceName = 'organisationUnitGroup';

  static fields: OrganisationUnitGroupField[] = [
    ...IDENTIFIABLE_FIELDS,
    'favorites',
    'symbol',
    'aggregationType',
    'access',
    'color',
    'description',
    'displayShortName',
    'externalAccess',
    'queryMods',
    'translations',
    'formName',
    'featureType',
    'members',
    'href',
    'displayDescription',
    'lastUpdatedBy',
    'userGroupAccesses',
    'dimensionItem',
    'created',
    'attributeValues',
    'groupSets',
    'sharing',
    'displayFormName',
    'userAccesses',
    'legendSet',
    'name',
    'legendSets',
    'geometry',
    'user',
    'favorite',
    'dimensionItemType',
  ];

  favorites?: any[];
  symbol?: string;
  aggregationType?: any;
  access?: any;
  color?: string;
  publicAccess?: string;
  description?: string;
  displayShortName?: string;
  externalAccess?: boolean;
  queryMods?: any;
  translations?: any[];
  formName?: string;
  featureType?: any;
  members?: any[];
  uid?: string;
  href?: string;
  displayDescription?: string;
  lastUpdatedBy?: any;
  userGroupAccesses?: any[];
  dimensionItem?: string;
  groupSets?: any[];
  sharing?: any;
  displayFormName?: string;
  createdBy?: any;
  userAccesses?: any[];
  legendSet?: any;
  legendSets?: any[];
  geometry?: any;
  user?: any;
  favorite?: boolean;
  dimensionItemType?: any;

  constructor(organisationUnitGroup: Partial<OrganisationUnitGroup>) {
    super(organisationUnitGroup);
  }
}
