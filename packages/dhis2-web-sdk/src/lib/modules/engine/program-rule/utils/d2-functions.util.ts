// @flow

import dateUtils from './date.utils';
import getZScoreWFA from './z-score-wfa.util';
import trimQuotes from './trim-quotes.util';
import { ValueConverter } from './value-converter.util';

export const d2FuctionsVariables: Array<{
  name: string;
  parameters?: number;
}> = [
  { name: 'd2:daysBetween', parameters: 2 },
  { name: 'd2:weeksBetween', parameters: 2 },
  { name: 'd2:monthsBetween', parameters: 2 },
  { name: 'd2:yearsBetween', parameters: 2 },
  { name: 'd2:floor', parameters: 1 },
  { name: 'd2:modulus', parameters: 2 },
  { name: 'd2:concatenate' },
  { name: 'd2:addDays', parameters: 2 },
  { name: 'd2:zing', parameters: 1 },
  { name: 'd2:oizp', parameters: 1 },
  { name: 'd2:count', parameters: 1 },
  { name: 'd2:countIfZeroPos', parameters: 1 },
  { name: 'd2:countIfValue', parameters: 2 },
  { name: 'd2:ceil', parameters: 1 },
  { name: 'd2:round', parameters: 1 },
  { name: 'd2:hasValue', parameters: 1 },
  { name: 'd2:lastEventDate', parameters: 1 },
  { name: 'd2:validatePattern', parameters: 2 },
  { name: 'd2:addControlDigits', parameters: 1 },
  { name: 'd2:checkControlDigits', parameters: 1 },
  { name: 'd2:left', parameters: 2 },
  { name: 'd2:right', parameters: 2 },
  { name: 'd2:substring', parameters: 3 },
  { name: 'd2:split', parameters: 3 },
  { name: 'd2:zScoreWFA', parameters: 3 },
  { name: 'd2:length', parameters: 1 },
];

export const d2FunctionsEval: { [x: string]: Function } = {
  'd2:hasValue': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [value] = parameters || [];

    const valueFound =
      !!value ||
      Number(value) === 0 ||
      ValueConverter.toBoolean(value) === false;

    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, valueFound);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:daysBetween': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [date1, date2] = parameters;
    const daysBetween = dateUtils.daysBetween(date1, date2);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, daysBetween);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:weeksBetween': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [date1, date2] = parameters;
    const weeksBetween = dateUtils.weeksBetween(date1, date2);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, weeksBetween);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:monthsBetween': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [date1, date2] = parameters;
    const monthsBetween = dateUtils.monthsBetween(date1, date2);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, monthsBetween);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:yearsBetween': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [date1, date2] = parameters;
    const yearsBetween = dateUtils.yearsBetween(date1, date2);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, yearsBetween);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:floor': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [date1, ...rest] = parameters;
    const floored = Math.floor(date1);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, floored);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:modulus': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [dividend, divisor] = parameters;
    const rest = Number(dividend) % Number(divisor);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, rest);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:concatenate': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    let returnString = "'";
    for (let i = 0; i < parameters.length; i++) {
      returnString += parameters[i];
    }

    returnString += "'";
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, returnString);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:addDays': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [date, daysToAdd] = parameters;
    const newDate = dateUtils.addDays(date, daysToAdd);
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, newDate);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:zing': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    const numBer = parameters[0] < 0 ? 0 : parameters[0];
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, numBer);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:oizp': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    const numBer = parameters[0] < 0 ? 0 : 1;
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, numBer);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:count': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const [variableName, ..._] = parameters;
    const variableObject = variableHash[variableName];
    const count =
      variableObject && variableObject.hasValue && variableObject.allValues
        ? variableObject.allValues.length
        : 0;
    if (!variableObject) {
      // log.warn('could not find variable to count: ' + variableName);
    }
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, count);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:countIfZeroPos': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const variableName = trimQuotes(parameters[0]);
    const variableObject = variableHash[variableName];
    let count = 0;
    if (variableObject) {
      if (variableObject.hasValue) {
        if (variableObject.allValues && variableObject.allValues.length > 0) {
          for (let i = 0; i < variableObject.allValues.length; i++) {
            if (variableObject.allValues[i] >= 0) {
              count++;
            }
          }
        } else {
          //The variable has a value, but no list of alternates. This means we only compare the elements real value
          if (variableObject.variableValue >= 0) {
            count = 1;
          }
        }
      }
    } else {
      // log.warn('could not find variable to countifzeropos: ' + variableName);
    }
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, count);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:countIfValue': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const variableName = trimQuotes(parameters[0]);
    const variableObject = variableHash[variableName];
    const valueToCompare = parameters[1];

    let count = 0;
    if (variableObject) {
      if (variableObject.hasValue) {
        if (variableObject.allValues && variableObject.allValues.length > 0) {
          for (let i = 0; i < variableObject.allValues.length; i++) {
            if (valueToCompare === variableObject.allValues[i]) {
              count++;
            }
          }
        } else {
          //The variable has a value, but no list of alternates. This means we only compare the elements real value
          if (variableObject.variableValue >= 0) {
            count = 1;
          }
        }
      }
    } else {
      // log.warn('could not find variable to countifzeropos: ' + variableName);
    }
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, count);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:ceil': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(
      regexFunct,
      Math.ceil(parameters[0])
    );
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:round': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(
      regexFunct,
      Math.round(parameters[0])
    );
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:lastEventDate': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const variableName = parameters[0];
    const variableObject = variableHash[variableName];
    let valueFound = "''";
    if (variableObject) {
      if (variableObject.variableEventDate) {
        // TODO: Find best way to process date variables
        valueFound = variableObject.variableEventDate;
      } else {
        // log.warn('no last event date found for variable: ' + variableName);
      }
    } else {
      // log.warn(
      //   'could not find variable to check last event date: ' + variableName
      // );
    }

    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, valueFound);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:validatePattern': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    const inputToValidate = parameters[0].toString();
    const pattern = parameters[1];
    const regEx = new RegExp(pattern, 'g');
    const match = inputToValidate.match(regEx);

    const matchFound =
      match !== null && inputToValidate === match[0] ? true : false;

    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, matchFound);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:addControlDigits': (
    expression: any,
    parameters: Array<any>,
    variableHash: any,
    regexFunct: string
  ) => {
    const baseNumber = parameters[0];
    let newExpression;
    const baseDigits = baseNumber.split('');
    const error = false;

    let firstDigit = 0;
    let secondDigit = 0;
    const baseNumberLength = baseDigits && baseDigits.length;
    if (baseDigits && baseDigits.length < 10) {
      let firstSum = 0;
      const baseNumberLength = baseDigits.length;
      //weights support up to 9 base digits:
      const firstWeights = [3, 7, 6, 1, 8, 9, 4, 5, 2];
      for (let i = 0; i < baseNumberLength && !error; i++) {
        firstSum += parseInt(baseDigits[i]) * firstWeights[i];
      }
      firstDigit = firstSum % 11;

      //Push the first digit to the array before continuing, as the second digit is a result of the
      //base digits and the first control digit.
      baseDigits.push(firstDigit);
      //Weights support up to 9 base digits plus first control digit:
      const secondWeights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
      let secondSum = 0;
      for (let i = 0; i < baseNumberLength + 1 && !error; i++) {
        secondSum += parseInt(baseDigits[i]) * secondWeights[i];
      }
      secondDigit = secondSum % 11;

      if (firstDigit === 10) {
        // log.warn('First control digit became 10, replacing with 0');
        firstDigit = 0;
      }
      if (secondDigit === 10) {
        // log.warn('Second control digit became 10, replacing with 0');
        secondDigit = 0;
      }
    } else {
      // log.warn(
      //   'Base nuber not well formed(' +
      //     baseNumberLength +
      //     ' digits): ' +
      //     baseNumber
      // );
    }

    if (!error) {
      //Replace the end evaluation of the dhis function:
      newExpression = expression.replace(
        regexFunct,
        baseNumber + firstDigit + secondDigit
      );
    } else {
      //Replace the end evaluation of the dhis function:
      newExpression = expression.replace(regexFunct, baseNumber);
    }
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:checkControlDigits': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    // log.warn('checkControlDigits not implemented yet');

    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(regexFunct, parameters[0]);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:left': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    const string = String(parameters[0]);
    const numChars =
      string.length < parameters[1] ? string.length : parameters[1];
    const returnString = string.substring(0, numChars);
    const newExpression = expression.replace(regexFunct, returnString);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:right': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    const string = String(parameters[0]);
    const numChars =
      string.length < parameters[1] ? string.length : parameters[1];
    const returnString = string.substring(
      string.length - numChars,
      string.length
    );

    const newExpression = expression.replace(regexFunct, returnString);
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:substring': (
    expression: any,
    parameters: Array<number>,
    variableHash: any,
    regexFunct: string
  ) => {
    const string = String(parameters[0]);
    const startChar = string.length < parameters[1] - 1 ? -1 : parameters[1];
    const endChar = string.length < parameters[2] ? -1 : parameters[2];
    let newExpression;
    const expressionUpdated = true;
    if (startChar < 0 || endChar < 0) {
      expression = expression.replace(regexFunct, "''");
    } else {
      const returnString = string.substring(startChar, endChar);
      expression = expression.replace(regexFunct, returnString);
    }
    return { expression: newExpression, expressionUpdated };
  },
  'd2:split': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(
      regexFunct,
      String(parameters[0]).length
    );
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:zScoreWFA': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(
      regexFunct,
      getZScoreWFA(
        parseFloat(parameters[0]),
        parseFloat(parameters[1]),
        parameters[2]
      )
    );
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
  'd2:length': (
    expression: any,
    parameters: Array<string>,
    variableHash: any,
    regexFunct: string
  ) => {
    //Replace the end evaluation of the dhis function:
    const newExpression = expression.replace(
      regexFunct,
      String(parameters[0]).length
    );
    const expressionUpdated = true;
    return { expression: newExpression, expressionUpdated };
  },
};
