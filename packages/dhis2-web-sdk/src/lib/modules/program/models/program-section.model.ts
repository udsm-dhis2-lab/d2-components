// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { TrackedEntityAttribute } from './tracked-entity-attribute.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';
import { tr } from 'date-fns/locale';

export type ProgramSectionField =
  | IdentifiableField
  | 'formName'
  | 'sortOrder'
  | 'renderType';

export class ProgramSection extends IdentifiableObject<ProgramSection> {
  static resourceName = 'programSections';
  static singularResourceName = 'programSection';
  static fields: ProgramSectionField[] = [
    ...IDENTIFIABLE_FIELDS,
    'formName',
    'sortOrder',
    'renderType',
  ];
  formName?: string;
  sortOrder!: number;
  renderType?: string;
  trackedEntityAttributes?: TrackedEntityAttribute[];

  constructor(programSection: Partial<ProgramSection>) {
    super(programSection);
    this.trackedEntityAttributes = (
      programSection.trackedEntityAttributes || []
    ).map(
      (trackedEntityAttribute) =>
        new TrackedEntityAttribute(trackedEntityAttribute)
    );
  }
}
