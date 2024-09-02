// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ProgramRuleAction } from './program-rule-action.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramRuleField = IdentifiableField | 'condition';

export class ProgramRule extends IdentifiableObject<ProgramRule> {
  static resourceName = 'programRules';
  static singularResourceName = 'programRule';
  // TODO: Use class reflection
  static fields: ProgramRuleField[] = [...IDENTIFIABLE_FIELDS, 'condition'];

  condition!: string;
  program!: any;
  programRuleActions!: ProgramRuleAction[];

  constructor(programRule: Partial<ProgramRule>) {
    super(programRule);
    this.programRuleActions = (programRule.programRuleActions || []).map(
      (programRuleAction) => new ProgramRuleAction(programRuleAction)
    );
  }
}
