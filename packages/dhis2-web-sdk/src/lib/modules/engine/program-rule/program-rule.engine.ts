// /* eslint-disable no-constant-condition */
// // Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// // Use of this source code is governed by a BSD-style

// import { flatten } from 'lodash';
// import { dhisD2Functions } from './utils';
// import { format } from 'date-fns';

// // license that can be found in the LICENSE file.
// export class ProgramRuleEngine {
//   rules!: any[];
//   dataValues!: Record<string, unknown>;

//   setRules(rules: any[]) {
//     this.rules = rules;
//     return this;
//   }

//   setDataValues(dataValues: Record<string, unknown>) {
//     const currentDate = format(new Date(), 'yyyy-MM-dd');

//     this.dataValues = { ...(dataValues || {}), current_date: currentDate };
//     return this;
//   }

//   getAssignedData(assignedDataExpression: string): string | undefined {
//     let assignedData = assignedDataExpression || '';
//     try {
//       Object.keys(this.dataValues).forEach((key) => {
//         assignedData = assignedData.replace(
//           new RegExp(`{${key}}`, 'g'),
//           `'${this.dataValues[key]}'`
//         );
//       });

//       if (assignedData.includes('d2:')) {
//         assignedData = dhisD2Functions(assignedData, {});
//       }
//     } catch (err: any) {
//       console.warn('Problem processing assigned value', err);
//       return undefined;
//     }

//     return assignedData !== 'NaN' ? assignedData : undefined;
//   }

//   execute(): any[] {
//     return flatten(
//       (this.rules || []).map((rule) => {
//         if (!rule) {
//           return [];
//         }
//         let ruleCondition = rule.condition || '';

//         Object.keys(this.dataValues).forEach((key) => {
//           ruleCondition = ruleCondition.replace(
//             new RegExp(`{${key}}`, 'g'),
//             `'${this.dataValues[key]}'`
//           );
//         });

//         if (ruleCondition.includes('d2:')) {
//           ruleCondition = dhisD2Functions(ruleCondition, {});
//         }

//         let evaluationResult: boolean;
//         try {
//           evaluationResult = eval(ruleCondition);
//         } catch (e) {
//           //
//         }

//         return (rule.actions || []).map((action: Record<string, unknown>) => {
//           const actionType = evaluationResult ? action['actionType'] : '';

//           let assignedData;
//           if (actionType === 'ASSIGN') {
//             assignedData = this.getAssignedData(
//               action['assignedData'] as string
//             );
//           }
//           return {
//             ...action,
//             assignedData,
//             actionType,
//           };
//         });
//       })
//     );
//   }
// }


import { format } from 'date-fns';
import { dhisD2Functions } from './utils/run-d2-expression.util';
import { Option } from '../../option-set';


export interface IMetadataRuleAction {
  field: string;
  actionType: string;
  assignedData?: string;
  displayedContent?: string;
  options?: Partial<Option>[];
  programRule?: { id: string };
  evaluationTime?: 'ALWAYS' | 'ON_COMPLETE' | 'ON_CREATE' | string;
}

type Rule = { condition?: string; actions?: IMetadataRuleAction[] };


type ExecuteOptions = {
  /** return only triggered actions */
  triggeredOnly?: boolean;
  /** resolve duplicates by field (last wins) */
  dedupeByField?: boolean;
  /** include debug metadata */
  debug?: boolean;
};

export class ProgramRuleEngine {
  private rules: Rule[] = [];
  private dataValues: Record<string, unknown> = {};

  setRules(rules: Rule[]) {
    this.rules = Array.isArray(rules) ? rules : [];
    return this;
  }

  setDataValues(dataValues: Record<string, unknown>) {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    this.dataValues = { ...(dataValues || {}), current_date: currentDate };
    return this;
  }

  execute(options: ExecuteOptions = {}): IMetadataRuleAction[] {
    const triggeredOnly = options.triggeredOnly !== false;
    const dedupeByField = options.dedupeByField !== false;
    const debug = !!options.debug;

    const out: IMetadataRuleAction[] = [];
    const byField = new Map<string, IMetadataRuleAction>();

    for (const rule of this.rules) {
      if (!rule) continue;

      const rawCond = (rule.condition ?? '').trim();
      const preparedCond = this.prepareExpression(rawCond);

      const evalRes = this.safeEvalBoolean(preparedCond);

      for (const action of rule.actions ?? []) {
        if (!action) continue;

        const triggered = evalRes.ok ? evalRes.value : false;

        if (triggeredOnly && !triggered) continue;

        const actionType = triggered ? (action.actionType ?? '') : '';

        let assignedData: any = undefined;
        if (triggered && actionType === 'ASSIGN') {
          const expr = this.prepareExpression(String(action.assignedData ?? ''));
          // If you want the computed VALUE, evaluate it:
          const valRes = this.safeEvalAny(expr);
          assignedData = valRes.ok ? valRes.value : undefined;
        }

        const result: IMetadataRuleAction = {
          ...action,
          actionType,
          ...(actionType === 'ASSIGN' ? { assignedData } : {}),
          ...(debug
            ? {
                __debug: {
                  rawCondition: rawCond,
                  preparedCondition: preparedCond,
                  evalOk: evalRes.ok,
                  evalError: evalRes.ok ? undefined : evalRes.error,
                  triggered,
                },
              }
            : {}),
        };

        // dedupe by field if field exists
        const field = action.field;
        if (dedupeByField && field) {
          byField.set(field, result);
        } else {
          out.push(result);
        }
      }
    }

    return dedupeByField ? [...byField.values()] : out;
  }

  /** Replace {var} with safe JS literals + resolve d2: functions */
  private prepareExpression(expression: string): string {
    let exp = expression ?? '';

    // Replace {key} placeholders
    exp = exp.replace(/\{([^}]+)\}/g, (_m, keyRaw) => {
      const key = String(keyRaw).trim();
      const val = (this.dataValues as any)[key];

      // Decide how to treat missing values:
      // In DHIS2 rules, missing often behaves like empty string
      if (val === undefined) return "''";

      return toJsLiteral(val);
    });

    // Resolve d2: functions (after placeholders are resolved)
    if (exp.includes('d2:')) {
      exp = dhisD2Functions(exp, {}); // your util (fix its bugs below)
    }

    return exp;
  }

  private safeEvalBoolean(expression: string): { ok: true; value: boolean } | { ok: false; error: string } {
    const res = this.safeEvalAny(expression);
    return res.ok
      ? { ok: true, value: !!res.value }
      : { ok: false, error: res.error };
  }

  private safeEvalAny(expression: string): { ok: true; value: any } | { ok: false; error: string } {
    try {
      // NOTE: still evaluates JS, but does not capture outer scope.
      // Upgrade later to AST evaluation for full safety.
      const fn = new Function(`"use strict"; return (${expression});`);
      return { ok: true, value: fn() };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? String(e) };
    }
  }
}

function toJsLiteral(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return "''";
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);

  // Date strings and normal strings → quoted & escaped
  const s = String(v);
  // escape backslash and single quotes
  const escaped = s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${escaped}'`;
}
