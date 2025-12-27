// // Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// // Use of this source code is governed by a BSD-style
// // license that can be found in the LICENSE file.
// // @flow
// import { d2FuctionsVariables, d2FunctionsEval } from './d2-functions.util';
// import { isDefined } from './d2.util';

// export const dhisD2Functions = (
//   expression: string,
//   variableHash: { [x: string]: any }
// ): string => {
//   let evalExpression = expression;
//   if (isDefined && evalExpression.includes('d2:')) {
//     let continueLooping = true;
//     //Safety harness on 10 loops, in case of unanticipated syntax causing unintencontinued looping
//     for (let i = 0; i < 1 && continueLooping; i++) {
//       let expressionUpdated = false;
//       let brokenExecution = false;
//       d2FuctionsVariables.forEach((d2FnVar) => {
//         //Select the function call, with any number of parameters inside single quotations, or number parameters witout quotations
//         const d2FnRegex = new RegExp(
//           d2FnVar.name +
//             "\\( *(([\\d/\\*\\+\\-%. ]+)|( *'[^']*'))*( *, *(([\\d/\\*\\+\\-%. ]+)|'[^']*'))* *\\)",
//           'g'
//         );
//         const fnRegexCallArr = evalExpression.match(d2FnRegex);

//         if (fnRegexCallArr && fnRegexCallArr.length > 0) {
//           fnRegexCallArr.forEach((fnRegexCall) => {
//             // Remove the function name and paranthesis and remove whitespaces:
//             const fnParameters = fnRegexCall
//               // .replace(/(^[^\(]+\()|\)$/g, '')
//               .replace(/(^[^(]+\()|\)$/g, '')
//               .trim();

//             // Split into single parameters:
//             const parameters = fnParameters.match(/(('[^']+')|([^,]+))/g);

//             // Check if it has parameters and match the required parameters
//             if (isDefined(d2FnVar.parameters)) {
//               //But we are only checking parameters where the dhisFunction actually has a defined set of parameters(concatenate, for example, does not have a fixed number);
//               const numOfParameters = parameters ? parameters.length : 0;
//               if (numOfParameters !== d2FnVar.parameters) {
//                 // log.warn(d2FnVar.name + ' was called with the incorrect number of parameters');

//                 //Mark this function call as broken:
//                 brokenExecution = true;
//               }
//             }

//             //In case the function call is nested, the parameter itself contains an expression, run the expression.
//             if (
//               !brokenExecution &&
//               isDefined(parameters) &&
//               parameters !== null
//             ) {
//               for (let i = 0; i < parameters.length; i++) {
//                 parameters[i] = runRuleExpression(
//                   parameters[i],
//                   d2FnVar.name,
//                   `parameter:${i}`,
//                   variableHash
//                 );
//               }
//             }

//             //Special block for d2:weeksBetween(*,*) - add such a block for all other dhis functions.
//             if (brokenExecution) {
//               //Function call is not possible to evaluate, remove the call:
//               evalExpression = evalExpression.replace(fnRegexCall, 'false');
//               expressionUpdated = true;
//             }
//             const results = d2FunctionsEval[d2FnVar.name](
//               evalExpression,
//               parameters,
//               variableHash,
//               fnRegexCall
//             );

//             evalExpression = results.expression;
//             expressionUpdated = results.expressionUpdated;
//           });
//         }
//       });
//       //We only want to continue looping until we made a successful replacement,
//       //and there is still occurrences of "d2:" in the code. In cases where d2: occur outside
//       //the expected d2: function calls, one unneccesary iteration will be done and the
//       //successfulExecution will be false coming back here, ending the loop. The last iteration
//       //should be zero to marginal performancewise.
//       if (expressionUpdated && evalExpression.includes('d2:')) {
//         continueLooping = true;
//       } else {
//         continueLooping = false;
//       }
//     }
//   }

//   return evalExpression;
// };

// export const runRuleExpression = (
//   expression: string,
//   beforereplacement: string,
//   identifier: string,
//   variablesHash: any
// ) => {
//   const dhisfunctionsevaluated: string = dhisD2Functions(
//     expression,
//     variablesHash
//   );
//   try {
//     const canEvalRule = eval(dhisfunctionsevaluated);

//     return canEvalRule;
//   } catch (e) {
//     return false;
//   }
// };

// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// import { d2FuctionsVariables, d2FunctionsEval } from './d2-functions.util';
// import { isDefined } from './d2.util';

// type VariableHash = Record<string, any>;

// const DEFAULT_MAX_ITERATIONS = 10;

// /**
//  * Precompiled regex cache per d2 function name.
//  * Compiling regex repeatedly inside loops is expensive when rules execute often.
//  */
// const d2FnRegexCache = new Map<string, RegExp>();

// function getD2FnRegex(fnName: string): RegExp {
//   const cached = d2FnRegexCache.get(fnName);
//   if (cached) return cached;

//   // Select the function call, with any number of parameters inside single quotations,
//   // or number parameters without quotations
//   const rx = new RegExp(
//     fnName +
//       "\\( *(([\\d/\\*\\+\\-%. ]+)|( *'[^']*'))*( *, *(([\\d/\\*\\+\\-%. ]+)|'[^']*'))* *\\)",
//     'g'
//   );

//   d2FnRegexCache.set(fnName, rx);
//   return rx;
// }

// /**
//  * Splits parameters inside a function call.
//  * This is a simple splitter matching your existing behavior:
//  * - 'quoted strings' or raw tokens separated by commas
//  */
// function splitParams(paramStr: string): string[] {
//   // Match either '...'(single-quoted) OR any non-comma chunk
//   return paramStr.match(/(('[^']+')|([^,]+))/g)?.map((s) => s.trim()) ?? [];
// }

// /**
//  * Resolve DHIS2 d2:* functions inside an expression string.
//  * NOTE: returns a JS expression string (not evaluated).
//  */
// export const dhisD2Functions = (
//   expression: string,
//   variableHash: VariableHash = {},
//   maxIterations: number = DEFAULT_MAX_ITERATIONS
// ): string => {
//   let evalExpression = expression ?? '';

//   // ✅ Fix: do not check `if (isDefined && ...)` because isDefined is a function reference.
//   if (!evalExpression || !evalExpression.includes('d2:')) return evalExpression;

//   // Safety harness: bounded iterations to avoid infinite replacement loops
//   for (let iter = 0; iter < maxIterations; iter++) {
//     let expressionUpdated = false;

//     for (const d2FnVar of d2FuctionsVariables) {
//       const fnName = d2FnVar.name;
//       const d2FnRegex = getD2FnRegex(fnName);

//       const fnRegexCallArr = evalExpression.match(d2FnRegex);
//       if (!fnRegexCallArr || fnRegexCallArr.length === 0) continue;

//       for (const fnRegexCall of fnRegexCallArr) {
//         let brokenExecution = false;

//         // Remove the function name and parentheses, then trim:
//         const fnParametersRaw = fnRegexCall.replace(/(^[^(]+\()|\)$/g, '').trim();
//         const parameters = splitParams(fnParametersRaw);

//         // Validate required parameters (only for fixed-arity functions)
//         if (isDefined(d2FnVar.parameters)) {
//           const requiredCount = d2FnVar.parameters as number;
//           if ((parameters?.length ?? 0) !== requiredCount) {
//             brokenExecution = true;
//           }
//         }

//         // For nested calls: run function resolver on parameters (string-level), not boolean-eval.
//         if (!brokenExecution && isDefined(parameters) && parameters !== null) {
//           for (let i = 0; i < parameters.length; i++) {
//             parameters[i] = String(
//               runRuleExpression(parameters[i], fnName, `parameter:${i}`, variableHash)
//             );
//           }
//         }

//         if (brokenExecution) {
//           // If impossible to evaluate, remove the call
//           evalExpression = evalExpression.replace(fnRegexCall, 'false');
//           expressionUpdated = true;
//           continue;
//         }

//         // Evaluate this function via your mapping
//         const evaluator = (d2FunctionsEval as any)[fnName];
//         if (typeof evaluator !== 'function') {
//           // Unknown function: neutralize safely
//           evalExpression = evalExpression.replace(fnRegexCall, 'false');
//           expressionUpdated = true;
//           continue;
//         }

//         const results = evaluator(evalExpression, parameters, variableHash, fnRegexCall);

//         // preserve your contract:
//         evalExpression = results.expression;
//         expressionUpdated = expressionUpdated || !!results.expressionUpdated;
//       }
//     }

//     // Stop if nothing changed, or no more d2:
//     if (!expressionUpdated || !evalExpression.includes('d2:')) break;
//   }

//   return evalExpression;
// };

// /**
//  * Resolves nested function expressions or inner boolean fragments safely.
//  * IMPORTANT: Do NOT collapse failures to `false` (it can change semantics).
//  * Instead return the original expression, so outer evaluation can decide.
//  */
// export const runRuleExpression = (
//   expression: string,
//   beforereplacement: string,
//   identifier: string,
//   variablesHash: VariableHash
// ): any => {
//   const dhisfunctionsevaluated: string = dhisD2Functions(expression, variablesHash);

//   // Try to eval only if it looks like a JS literal/boolean/number expression,
//   // but keep backward compatibility with your current behavior.
//   try {
//     // eslint-disable-next-line no-new-func
//     const fn = new Function(`"use strict"; return (${dhisfunctionsevaluated});`);
//     return fn();
//   } catch (e) {
//     // ✅ Change: return original evaluated string rather than false to avoid
//     // mutating meaning in outer function evaluation.
//     return dhisfunctionsevaluated;
//   }
// };

import { d2FuctionsVariables, d2FunctionsEval } from './d2-functions.util';
import { isDefined } from './d2.util';

type VariableHash = Record<string, any>;

const DEFAULT_MAX_ITERATIONS = 10;

/**
 * Precompiled regex cache per d2 function name.
 */
const d2FnRegexCache = new Map<string, RegExp>();

function getD2FnRegex(fnName: string): RegExp {
  const cached = d2FnRegexCache.get(fnName);
  if (cached) return cached;

  /**
   * Supports:
   * - numeric/operator-ish chunks: 12, 1+2, 3.5, -4
   * - single-quoted strings: 'ALU'
   * - double-quoted strings: "ALU"
   *
   * NOTE: This still won't fully parse arbitrarily nested expressions, but it's
   * better aligned with common DHIS2 rule expressions.
   */
  const rx = new RegExp(
    fnName +
      '\\( *(([\\d/\\*\\+\\-%. ]+)|( *\'[^\']*\')|( *"[^"]*"))*' +
      '( *, *(([\\d/\\*\\+\\-%. ]+)|\'[^\']*\'|"[^"]*"))* *\\)',
    'g'
  );

  d2FnRegexCache.set(fnName, rx);
  return rx;
}

/**
 * Robust param splitter:
 * - respects commas inside quotes
 * - supports both single and double quotes
 */
function splitParams(paramStr: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < paramStr.length; i++) {
    const ch = paramStr[i];

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      cur += ch;
      continue;
    }

    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      cur += ch;
      continue;
    }

    if (ch === ',' && !inSingle && !inDouble) {
      const trimmed = cur.trim();
      if (trimmed) out.push(trimmed);
      cur = '';
      continue;
    }

    cur += ch;
  }

  const last = cur.trim();
  if (last) out.push(last);

  return out;
}

/**
 * Heuristic: only eval if it looks like a primitive/boolean/numeric expression,
 * not a raw string like "'ALU'" or "{var}" placeholders.
 */
function shouldEval(expr: string): boolean {
  const s = expr.trim();

  // If it contains placeholders or d2 calls, don't eval here (outer layer decides)
  if (s.includes('{') || s.includes('d2:')) return false;

  // If it's clearly a quoted string, don't eval (return as string expression)
  if (
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('"') && s.endsWith('"'))
  )
    return false;

  // Allow booleans / numbers / simple operators
  return /^[\d\s()+\-*/%.<>=!&|?:truefalsenullundefined]+$/i.test(s);
}

/**
 * Resolve DHIS2 d2:* functions inside an expression string.
 * Returns a JS expression string (not evaluated).
 */
export const dhisD2Functions = (
  expression: string,
  variableHash: VariableHash = {},
  maxIterations: number = DEFAULT_MAX_ITERATIONS
): string => {
  let evalExpression = expression ?? '';
  if (!evalExpression || !evalExpression.includes('d2:')) return evalExpression;

  for (let iter = 0; iter < maxIterations; iter++) {
    let expressionUpdated = false;
    const beforeIter = evalExpression;

    for (const d2FnVar of d2FuctionsVariables) {
      const fnName = d2FnVar.name;
      const d2FnRegex = getD2FnRegex(fnName);

      const matches = evalExpression.match(d2FnRegex);
      if (!matches || matches.length === 0) continue;

      for (const fnCall of matches) {
        // Extract parameters
        const fnParametersRaw = fnCall.replace(/(^[^(]+\()|\)$/g, '').trim();
        const parameters = splitParams(fnParametersRaw);

        // Validate fixed arity
        if (isDefined(d2FnVar.parameters)) {
          const requiredCount = d2FnVar.parameters as number;
          if ((parameters?.length ?? 0) !== requiredCount) {
            evalExpression = evalExpression.replace(fnCall, 'false');
            expressionUpdated = true;
            continue;
          }
        }

        // Resolve nested d2 calls inside params (string-level)
        const resolvedParams = parameters.map((p, idx) =>
          String(runRuleExpression(p, fnName, `parameter:${idx}`, variableHash))
        );

        const evaluator = (d2FunctionsEval as any)[fnName];
        if (typeof evaluator !== 'function') {
          evalExpression = evalExpression.replace(fnCall, 'false');
          expressionUpdated = true;
          continue;
        }

        const results = evaluator(
          evalExpression,
          resolvedParams,
          variableHash,
          fnCall
        );
        evalExpression = results.expression;

        // Be robust even if legacy evaluator forgets to set expressionUpdated
        expressionUpdated = expressionUpdated || !!results.expressionUpdated;
      }
    }

    // Stronger progress detection (protect against legacy evaluator inconsistencies)
    if (!expressionUpdated && evalExpression === beforeIter) break;

    if (!evalExpression.includes('d2:')) break;
  }

  return evalExpression;
};

/**
 * Resolves nested function expressions safely.
 * Returns evaluated primitive when safe; otherwise returns the string expression.
 */
export const runRuleExpression = (
  expression: string,
  _beforereplacement: string,
  _identifier: string,
  variablesHash: VariableHash
): any => {
  const resolved = dhisD2Functions(expression, variablesHash);

  if (!shouldEval(resolved)) return resolved;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${resolved});`);
    return fn();
  } catch {
    return resolved;
  }
};
