// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { TrackedEntityAttribute } from './tracked-entity-attribute.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramTrackedEntityAttributeField =
  | IdentifiableField
  | 'trackedEntityAttribute'
  | 'searchable'
  | 'renderOptionsAsRadio'
  | 'sortOrder'
  | 'mandatory'
  | 'displayInList'
  | 'allowFutureDate';

export class ProgramTrackedEntityAttribute extends IdentifiableObject<ProgramTrackedEntityAttribute> {
  static resourceName = 'programTrackedEntityAttributes';
  static singularResourceName = 'programTrackedEntityAttribute';
  // TODO: Use class reflection
  static fields: ProgramTrackedEntityAttributeField[] = [
    ...IDENTIFIABLE_FIELDS,
    'trackedEntityAttribute',
    'searchable',
    'renderOptionsAsRadio',
    'sortOrder',
    'mandatory',
    'displayInList',
    'allowFutureDate',
  ];
  trackedEntityAttribute!: TrackedEntityAttribute;
  searchable?: boolean;
  renderOptionsAsRadio?: boolean;
  sortOrder!: number;
  mandatory?: boolean;
  displayInList?: boolean;
  allowFutureDate?: boolean;

  constructor(
    programTrackedEntityAttribute: Partial<ProgramTrackedEntityAttribute>
  ) {
    super(programTrackedEntityAttribute);
    this.trackedEntityAttribute = new TrackedEntityAttribute(
      programTrackedEntityAttribute.trackedEntityAttribute || {}
    );
  }
}
