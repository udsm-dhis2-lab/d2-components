// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { OptionSet } from '../../option-set';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type DataElementProperty =
  | IdentifiableField
  | 'formName'
  | 'valueType'
  | 'aggregationType'
  | 'domainType'
  | 'displayDescription'
  | 'displayFormName'
  | 'skipSynchronization'
  | 'zeroIsSignificant'
  | 'periodOffset'
  | 'optionSetValue'
  | 'optionSet';

export class DataElement extends IdentifiableObject<DataElement> {
  static resourceName = 'dataElements';
  static singularResourceName = 'dataElement';
  static fields: DataElementProperty[] = [
    ...IDENTIFIABLE_FIELDS,
    'formName',
    'valueType',
    'aggregationType',
    'domainType',
    'displayDescription',
    'displayFormName',
    'skipSynchronization',
    'zeroIsSignificant',
    'periodOffset',
    'optionSetValue',
    'optionSet',
  ];

  formName?: string;
  valueType!: string;
  aggregationType!: string;
  domainType!: string;
  displayDescription?: string;
  displayFormName?: string;
  skipSynchronization?: boolean;
  zeroIsSignificant?: boolean;
  periodOffset?: number;
  optionSetValue?: boolean;
  optionSet?: OptionSet;
  programStageId?: string;
  isProgramStageRepeatable?: boolean;

  constructor(dataElement: Partial<DataElement>) {
    super(dataElement);
    if (dataElement.optionSetValue) {
      this.optionSet = new OptionSet(dataElement.optionSet || {});
    }
  }
}
