// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { OptionSet } from '../../option-set';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
  D2Property,
} from '../../../shared';

export type DataElementField =
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
  // static fields: DataElementField[] = [
  //   ...IDENTIFIABLE_FIELDS,
  //   'formName',
  //   'valueType',
  //   'aggregationType',
  //   'domainType',
  //   'displayDescription',
  //   'displayFormName',
  //   'skipSynchronization',
  //   'zeroIsSignificant',
  //   'periodOffset',
  //   'optionSetValue',
  //   'optionSet',
  // ];

  static fields: DataElementField[] = [
    ...IDENTIFIABLE_FIELDS,
    ...(Object.keys(DataElement.getProperties() || {}) as any),
  ];

  @D2Property
  formName?: string;
  @D2Property
  valueType!: string;
  @D2Property
  aggregationType!: string;
  @D2Property
  domainType!: string;
  @D2Property
  displayDescription?: string;
  @D2Property
  displayFormName?: string;
  @D2Property
  skipSynchronization?: boolean;
  @D2Property
  zeroIsSignificant?: boolean;
  @D2Property
  periodOffset?: number;
  @D2Property
  optionSetValue?: boolean;
  @D2Property
  optionSet?: OptionSet;

  constructor(dataElement: Partial<DataElement>) {
    super(dataElement);
    if (dataElement.optionSetValue) {
      this.optionSet = new OptionSet(dataElement.optionSet || {});
    }
  }
}
