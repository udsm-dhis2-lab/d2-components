// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { Option } from './option.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableObject,
  IdentifiableField,
} from '../../../shared';

export type OptionSetField = IdentifiableField | 'valueType' | 'options';

export class OptionSet extends IdentifiableObject<OptionSet> {
  static resourceName = 'optionSets';
  static singularResourceName = 'optionSet';
  static fields: OptionSetField[] = [
    ...IDENTIFIABLE_FIELDS,
    'valueType',
    'options',
  ];
  valueType!: string;
  options!: Option[];

  constructor(optionSet: Partial<OptionSet>) {
    super(optionSet);
    this.options = (optionSet.options || []).map(
      (option) => new Option(option)
    );
  }
}
