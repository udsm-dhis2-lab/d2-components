// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type LegendField =
  | IdentifiableField
  | 'startValue'
  | 'endValue'
  | 'color';

export class Legend extends IdentifiableObject<Legend> {
  static resourceName = 'legends';
  static singularResourceName = 'legend';
  static fields: LegendField[] = [
    ...IDENTIFIABLE_FIELDS,
    'startValue',
    'endValue',
    'color',
  ];

  startValue!: number;
  endValue!: number;
  color!: string;
}
