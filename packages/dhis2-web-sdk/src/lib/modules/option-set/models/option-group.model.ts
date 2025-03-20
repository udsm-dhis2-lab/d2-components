// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { Option } from './option.model';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableObject,
  IdentifiableField,
} from '../../../shared';

export type OptionGroupField = IdentifiableField | 'options';

export class OptionGroup extends IdentifiableObject<OptionGroup> {
  static resourceName = 'optionGroups';
  static singularResourceName = 'optionGroup';
  static fields: OptionGroupField[] = [...IDENTIFIABLE_FIELDS, 'options'];
  options!: Option[];

  constructor(optionGroup: Partial<OptionGroup>) {
    super(optionGroup);
    this.options = (optionGroup.options || []).map(
      (option) => new Option(option)
    );
  }
}
