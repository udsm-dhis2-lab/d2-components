// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type OrganisationUnitGroupSetField =
  | IdentifiableField
  | 'dimensionItemKeywords'
  | 'dataDimensionType'
  | 'favorites'
  | 'dimensionType'
  | 'aggregationType'
  | 'access'
  | 'publicAccess'
  | 'description'
  | 'eventRepetition'
  | 'displayShortName'
  | 'externalAccess'
  | 'optionSet'
  | 'translations'
  | 'valueType'
  | 'formName'
  | 'href'
  | 'organisationUnitGroups'
  | 'dimension'
  | 'displayDescription'
  | 'programStage'
  | 'lastUpdatedBy'
  | 'userGroupAccesses'
  | 'allItems'
  | 'attributeValues'
  | 'sharing'
  | 'displayFormName'
  | 'filter'
  | 'compulsory'
  | 'createdBy'
  | 'includeSubhierarchyInAnalytics'
  | 'userAccesses'
  | 'legendSet'
  | 'dataDimension'
  | 'items'
  | 'user'
  | 'favorite';

export class OrganisationUnitGroupSet extends IdentifiableObject<OrganisationUnitGroupSet> {
  static resourceName = 'organisationUnitGroups';
  static singularResourceName = 'organisationUnitGroup';

  static fields: OrganisationUnitGroupSetField[] = [
    ...IDENTIFIABLE_FIELDS,
    'dimensionItemKeywords',
    'dataDimensionType',
    'favorites',
    'dimensionType',
    'aggregationType',
    'access',
    'publicAccess',
    'description',
    'eventRepetition',
    'displayShortName',
    'externalAccess',
    'optionSet',
    'translations',
    'valueType',
    'formName',
    'href',
    'organisationUnitGroups',
    'dimension',
    'displayDescription',
    'programStage',
    'lastUpdatedBy',
    'userGroupAccesses',
    'allItems',
    'attributeValues',
    'sharing',
    'displayFormName',
    'filter',
    'compulsory',
    'createdBy',
    'includeSubhierarchyInAnalytics',
    'userAccesses',
    'legendSet',
    'dataDimension',
    'items',
    'user',
    'favorite',
  ];

  compulsory!: boolean;
  dataDimension!: boolean;
  dimensionItemKeywords?: any;
  dataDimensionType?: any;
  favorites?: any[];
  dimensionType?: any;
  aggregationType?: any;
  access?: any;
  publicAccess?: string;
  description?: string;
  eventRepetition?: any;
  displayShortName?: string;
  externalAccess?: boolean;
  optionSet?: any;
  translations?: any[];
  valueType?: any;
  formName?: string;
  uid?: string;
  href?: string;
  organisationUnitGroups?: any[];
  dimension?: string;
  displayDescription?: string;
  programStage?: any;
  lastUpdatedBy?: any;
  userGroupAccesses?: any[];
  allItems?: boolean;
  sharing?: any;
  displayFormName?: string;
  filter?: string;
  createdBy?: any;
  includeSubhierarchyInAnalytics?: boolean;
  userAccesses?: any[];
  legendSet?: any;
  items?: any[];
  user?: any;
  favorite?: boolean;

  constructor(organisationUnitGroupSet: Partial<OrganisationUnitGroupSet>) {
    super(organisationUnitGroupSet);
  }
}
