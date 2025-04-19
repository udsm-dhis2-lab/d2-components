// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DataElement } from '../../data-element';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';
import { TrackedEntityAttribute } from '../models';
import { OptionGroup, Option } from '../../option-set';

export type ProgramRuleActionField =
  | IdentifiableField
  | 'content'
  | 'data'
  | 'displayContent'
  | 'programRuleActionType'
  | 'evaluationTime'
  | 'dataElement'
  | 'trackedEntityAttribute'
  | 'optionGroup'
  | 'option'
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
    'optionGroup',
    'option',
    'programRule',
  ];

  content?: string;
  data?: string;
  displayContent?: string;
  programRuleActionType!: string;
  evaluationTime?: string;
  dataElement?: Partial<DataElement>;
  trackedEntityAttribute?: Partial<TrackedEntityAttribute>;
  optionGroup?: Partial<OptionGroup>;
  option?: Partial<Option>;
  programRule!: any;
}
