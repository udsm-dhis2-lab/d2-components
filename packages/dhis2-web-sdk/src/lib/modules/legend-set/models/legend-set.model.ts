// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';
import { Legend } from './legend.model';

export type LegendSetField = IdentifiableField | 'legends';

export class LegendSet extends IdentifiableObject<LegendSet> {
  static resourceName = 'legendSets';
  static singularResourceName = 'legendSet';
  static fields: LegendSetField[] = [...IDENTIFIABLE_FIELDS, 'legends'];

  legends!: Legend[];

  constructor(legendSet: Partial<LegendSet>) {
    super(legendSet);
    this.legends = (legendSet.legends || []).map(
      (legend) => new Legend(legend)
    );
  }
}
