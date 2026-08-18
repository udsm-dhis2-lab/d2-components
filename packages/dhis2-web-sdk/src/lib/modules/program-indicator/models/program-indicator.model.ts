// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';
import { LegendSet } from '../../legend-set';

export type ProgramIndicatorField =
  | IdentifiableField
  | 'expression'
  | 'filter'
  | 'analyticsType'
  | 'aggregationType'
  | 'decimals'
  | 'program'
  | 'legendSets';

export class ProgramIndicator extends IdentifiableObject<ProgramIndicator> {
  static resourceName = 'programIndicators';
  static singularResourceName = 'programIndicator';

  static fields: ProgramIndicatorField[] = [
    ...IDENTIFIABLE_FIELDS,
    'expression',
    'filter',
    'analyticsType',
    'aggregationType',
    'decimals',
    'program',
    'legendSets',
  ];

  expression!: string;
  filter?: string;
  analyticsType!: string;
  aggregationType!: string;
  decimals?: number;
  program!: { id: string };
  legendSets?: LegendSet[];
}
