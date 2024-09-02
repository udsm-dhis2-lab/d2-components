// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {
  IdentifiableObject,
  IdentifiableField,
  IDENTIFIABLE_FIELDS,
} from '../../../shared';
export type OptionField = IdentifiableField;
export class Option extends IdentifiableObject<Option> {
  static resourceName = 'options';
  static singularResourceName = 'option';
  static fields: OptionField[] = [...IDENTIFIABLE_FIELDS];
}
