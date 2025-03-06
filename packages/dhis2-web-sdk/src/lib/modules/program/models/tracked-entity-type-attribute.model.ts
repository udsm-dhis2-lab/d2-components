// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { TrackedEntityAttribute } from './tracked-entity-attribute.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type TrackedEntityTypeAttributeField =
  | IdentifiableField
  | 'trackedEntityAttribute'
  | 'searchable'
  | 'renderOptionsAsRadio'
  | 'sortOrder'
  | 'mandatory'
  | 'displayInList';

export class TrackedEntityTypeAttribute extends IdentifiableObject<TrackedEntityTypeAttribute> {
  static resourceName = 'trackedEntityTypeAttributes';
  static singularResourceName = 'trackedEntityTypeAttribute';
  // TODO: Use class reflection
  static fields: TrackedEntityTypeAttributeField[] = [
    ...IDENTIFIABLE_FIELDS,
    'trackedEntityAttribute',
    'searchable',
    'renderOptionsAsRadio',
    'sortOrder',
    'mandatory',
    'displayInList',
  ];
  trackedEntityAttribute!: TrackedEntityAttribute;
  searchable?: boolean;
  renderOptionsAsRadio?: boolean;
  sortOrder!: number;
  mandatory?: boolean;
  displayInList?: boolean;

  constructor(trackedEntityTypeAttribute: Partial<TrackedEntityTypeAttribute>) {
    super(trackedEntityTypeAttribute);
    this.trackedEntityAttribute = new TrackedEntityAttribute(
      trackedEntityTypeAttribute.trackedEntityAttribute || {}
    );
  }
}
