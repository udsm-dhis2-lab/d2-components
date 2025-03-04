// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style

import { flatten } from 'lodash';
import { dhisD2Functions } from './utils';

// license that can be found in the LICENSE file.
export class ProgramRuleEngine {
  rules!: any[];
  dataValues!: Record<string, unknown>;

  setRules(rules: any[]) {
    this.rules = rules;
    return this;
  }

  setDataValues(dataValues: Record<string, unknown>) {
    this.dataValues = dataValues;
    return this;
  }

  execute(): any[] {
    return flatten(
      (this.rules || []).map((rule) => {
        if (!rule) {
          return [];
        }
        let ruleCondition = rule.condition || '';

        Object.keys(this.dataValues).forEach((key) => {
          ruleCondition = ruleCondition.replace(
            new RegExp(`{${key}}`, 'g'),
            `'${this.dataValues[key]}'`
          );
        });

        if (ruleCondition.includes('d2:')) {
          ruleCondition = dhisD2Functions(ruleCondition, {});
        }

        let evaluationResult: boolean;
        try {
          evaluationResult = eval(ruleCondition);
        } catch (e) {
          //
        }

        return (rule.actions || []).map((action: Record<string, unknown>) => ({
          ...action,
          actionType: evaluationResult ? action['actionType'] : '',
        }));
      })
    );
  }
}
