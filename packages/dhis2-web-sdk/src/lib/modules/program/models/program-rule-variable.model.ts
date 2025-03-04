// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramRuleVariableField =
  | IdentifiableField
  | 'programRuleVariableSourceType'
  | 'useCodeForOptionSet'
  | 'dataElement'
  | 'trackedEntityAttribute';

export class ProgramRuleVariable extends IdentifiableObject<ProgramRuleVariable> {
  static resourceName = 'programRuleVariables';
  static singularResourceName = 'programRuleVariable';
  // TODO: Use class reflection
  static fields: ProgramRuleVariableField[] = [
    ...IDENTIFIABLE_FIELDS,
    'programRuleVariableSourceType',
    'useCodeForOptionSet',
    'dataElement',
    'trackedEntityAttribute',
  ];
  programRuleVariableSourceType!: string;
  useCodeForOptionSet?: boolean;
  dataElement?: any;
  trackedEntityAttribute?: any;
}
