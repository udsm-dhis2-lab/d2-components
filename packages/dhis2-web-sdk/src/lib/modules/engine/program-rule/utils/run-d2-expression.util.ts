// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// @flow
import { d2FuctionsVariables, d2FunctionsEval } from './d2-functions.util';
import { isDefined } from './d2.util';

export const dhisD2Functions = (
  expression: string,
  variableHash: { [x: string]: any }
): string => {
  let evalExpression = expression;
  if (isDefined && evalExpression.includes('d2:')) {
    let continueLooping = true;
    //Safety harness on 10 loops, in case of unanticipated syntax causing unintencontinued looping
    for (let i = 0; i < 1 && continueLooping; i++) {
      let expressionUpdated = false;
      let brokenExecution = false;
      d2FuctionsVariables.forEach((d2FnVar) => {
        //Select the function call, with any number of parameters inside single quotations, or number parameters witout quotations
        const d2FnRegex = new RegExp(
          d2FnVar.name +
            "\\( *(([\\d/\\*\\+\\-%. ]+)|( *'[^']*'))*( *, *(([\\d/\\*\\+\\-%. ]+)|'[^']*'))* *\\)",
          'g'
        );
        const fnRegexCallArr = evalExpression.match(d2FnRegex);

        if (fnRegexCallArr && fnRegexCallArr.length > 0) {
          fnRegexCallArr.forEach((fnRegexCall) => {
            // Remove the function name and paranthesis and remove whitespaces:
            const fnParameters = fnRegexCall
              .replace(/(^[^\(]+\()|\)$/g, '')
              .trim();

            // Split into single parameters:
            const parameters = fnParameters.match(/(('[^']+')|([^,]+))/g);

            // Check if it has parameters and match the required parameters
            if (isDefined(d2FnVar.parameters)) {
              //But we are only checking parameters where the dhisFunction actually has a defined set of parameters(concatenate, for example, does not have a fixed number);
              const numOfParameters = parameters ? parameters.length : 0;
              if (numOfParameters !== d2FnVar.parameters) {
                // log.warn(d2FnVar.name + ' was called with the incorrect number of parameters');

                //Mark this function call as broken:
                brokenExecution = true;
              }
            }

            //In case the function call is nested, the parameter itself contains an expression, run the expression.
            if (
              !brokenExecution &&
              isDefined(parameters) &&
              parameters !== null
            ) {
              for (let i = 0; i < parameters.length; i++) {
                parameters[i] = runRuleExpression(
                  parameters[i],
                  d2FnVar.name,
                  `parameter:${i}`,
                  variableHash
                );
              }
            }

            //Special block for d2:weeksBetween(*,*) - add such a block for all other dhis functions.
            if (brokenExecution) {
              //Function call is not possible to evaluate, remove the call:
              evalExpression = evalExpression.replace(fnRegexCall, 'false');
              expressionUpdated = true;
            }
            const results = d2FunctionsEval[d2FnVar.name](
              evalExpression,
              parameters,
              variableHash,
              fnRegexCall
            );

            evalExpression = results.expression;
            expressionUpdated = results.expressionUpdated;
          });
        }
      });
      //We only want to continue looping until we made a successful replacement,
      //and there is still occurrences of "d2:" in the code. In cases where d2: occur outside
      //the expected d2: function calls, one unneccesary iteration will be done and the
      //successfulExecution will be false coming back here, ending the loop. The last iteration
      //should be zero to marginal performancewise.
      if (expressionUpdated && evalExpression.includes('d2:')) {
        continueLooping = true;
      } else {
        continueLooping = false;
      }
    }
  }

  return evalExpression;
};

export const runRuleExpression = (
  expression: string,
  beforereplacement: string,
  identifier: string,
  variablesHash: any
) => {
  const dhisfunctionsevaluated: string = dhisD2Functions(
    expression,
    variablesHash
  );
  try {
    const canEvalRule = eval(dhisfunctionsevaluated);

    return canEvalRule;
  } catch (e) {
    return false;
  }
};
