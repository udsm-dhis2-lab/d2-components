// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import * as _ from 'lodash';

export const numberIsFinite =
  Number.isFinite ||
  function (param) {
    return typeof param === 'number';
  };

export function isNumber(param: any) {
  return typeof param === 'number' && numberIsFinite(param);
}

/**
 * Check if the value is a String
 *
 * @name isString
 * @param param Value to be checked
 * @returns {boolean} Returns true when the `param` is a String
 */
export const isString = _.isString;

/**
 * Check if `param` is defined.
 *
 * @param {*} param The value to check
 * @returns {boolean} Returns `false` when `param` is `undefined` otherwise true.
 */
export function isDefined(param: any) {
  return typeof param !== 'undefined';
}
