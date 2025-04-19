// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { OptionSet } from '../../option-set';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type TrackedEntityAttributeField =
  | IdentifiableField
  | 'formName'
  | 'valueType'
  | 'aggregationType'
  | 'generated'
  | 'unique'
  | 'optionSetValue'
  | 'optionSetValueCount'
  | 'optionSet';
export class TrackedEntityAttribute extends IdentifiableObject<TrackedEntityAttribute> {
  static resourceName = 'trackedEntityAttributes';
  static singularResourceName = 'trackedEntityAttribute';
  // TODO: Use class reflection
  static fields: TrackedEntityAttributeField[] = [
    ...IDENTIFIABLE_FIELDS,
    'formName',
    'valueType',
    'aggregationType',
    'generated',
    'unique',
    'optionSetValue',
    'optionSetValueCount',
    'optionSet',
  ];
  formName?: string;
  valueType!: string;
  aggregationType?: string;
  generated?: boolean;
  unique?: boolean;
  optionSetValue?: boolean;
  optionSetValueCount?: number;
  optionSet?: OptionSet;
  allowFutureDate?: boolean;
  sortOrder?: number;

  constructor(trackedEntityAttribute: Partial<TrackedEntityAttribute>) {
    super(trackedEntityAttribute);
    if (trackedEntityAttribute.optionSetValue) {
      this.optionSet = new OptionSet(trackedEntityAttribute.optionSet || {});
    }
  }
}
