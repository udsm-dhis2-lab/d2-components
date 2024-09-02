// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramRuleActionField =
  | IdentifiableField
  | 'content'
  | 'data'
  | 'displayContent'
  | 'programRuleActionType'
  | 'evaluationTime'
  | 'dataElement'
  | 'trackedEntityAttribute'
  | 'programRule';

export class ProgramRuleAction extends IdentifiableObject<ProgramRuleAction> {
  static resourceName = 'programRuleActions';
  static singularResourceName = 'programRuleAction';
  // TODO: Use class reflection
  static fields: ProgramRuleActionField[] = [
    ...IDENTIFIABLE_FIELDS,
    'content',
    'data',
    'displayContent',
    'programRuleActionType',
    'evaluationTime',
    'dataElement',
    'trackedEntityAttribute',
    'programRule',
  ];

  content?: string;
  data?: string;
  displayContent?: string;
  programRuleActionType!: string;
  evaluationTime?: string;
  dataElement?: string;
  trackedEntityAttribute?: string;
  programRule!: any;
}
