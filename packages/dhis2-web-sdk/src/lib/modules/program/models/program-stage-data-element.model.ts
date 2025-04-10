// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file
import { DataElement } from '../../data-element';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramStageDataElementField =
  | IdentifiableField
  | 'displayInReports'
  | 'compulsory'
  | 'sortOrder'
  | 'allowFutureDate'
  | 'renderOptionsAsRadio'
  | 'dataElement';
export class ProgramStageDataElement extends IdentifiableObject<ProgramStageDataElement> {
  static resourceName = 'programStageDataElements';
  static singularResourceName = 'programStageDataElement';
  // TODO: Use class reflection
  static fields: ProgramStageDataElementField[] = [
    ...IDENTIFIABLE_FIELDS,
    'displayInReports',
    'compulsory',
    'sortOrder',
    'allowFutureDate',
    'renderOptionsAsRadio',
    'dataElement',
  ];
  displayInReports?: boolean;
  compulsory?: boolean;
  sortOrder!: number;
  allowFutureDate?: boolean;
  renderOptionsAsRadio?: boolean;
  dataElement!: DataElement;

  constructor(programStageDataElement: Partial<ProgramStageDataElement>) {
    super(programStageDataElement);
    this.dataElement = new DataElement(
     { ...(programStageDataElement.dataElement || {}), sortOrder: programStageDataElement.sortOrder}
    );
  }
}


