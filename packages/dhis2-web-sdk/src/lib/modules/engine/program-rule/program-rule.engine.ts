// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style

import { flatten } from 'lodash';
import { dhisD2Functions } from './utils';
import { format } from 'date-fns';

// license that can be found in the LICENSE file.
export class ProgramRuleEngine {
  rules!: any[];
  dataValues!: Record<string, unknown>;

  setRules(rules: any[]) {
    this.rules = rules;
    return this;
  }

  setDataValues(dataValues: Record<string, unknown>) {
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    this.dataValues = { ...(dataValues || {}), current_date: currentDate };
    return this;
  }

  getAssignedData(assignedDataExpression: string): string | undefined {
    let assignedData = assignedDataExpression || '';
    try {
      Object.keys(this.dataValues).forEach((key) => {
        assignedData = assignedData.replace(
          new RegExp(`{${key}}`, 'g'),
          `'${this.dataValues[key]}'`
        );
      });

      if (assignedData.includes('d2:')) {
        assignedData = dhisD2Functions(assignedData, {});
      }
    } catch (err: any) {
      console.warn('Problem processing assigned value', err);
      return undefined;
    }

    return assignedData !== 'NaN' ? assignedData : undefined;
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

        return (rule.actions || []).map((action: Record<string, unknown>) => {
          const actionType = evaluationResult ? action['actionType'] : '';

          let assignedData;
          if (actionType === 'ASSIGN') {
            assignedData = this.getAssignedData(
              action['assignedData'] as string
            );
          }
          return {
            ...action,
            assignedData,
            actionType,
          };
        });
      })
    );
  }
}
