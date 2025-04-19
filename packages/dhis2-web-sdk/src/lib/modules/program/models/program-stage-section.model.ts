// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { DataElement } from '../../data-element';
import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';

export type ProgramStageSectionField =
  | IdentifiableField
  | 'sortOrder'
  | 'renderType'
  | 'dataElements';
export class ProgramStageSection extends IdentifiableObject<ProgramStageSection> {
  static resourceName = 'programStageSections';
  static singularResourceName = 'programStageSection';
  // TODO: Use class reflection
  static fields: ProgramStageSectionField[] = [
    ...IDENTIFIABLE_FIELDS,
    'sortOrder',
    'renderType',
    'dataElements',
  ];
  sortOrder!: number;
  renderType: any;
  dataElements!: DataElement[];

  constructor(programStageSection: Partial<ProgramStageSection>) {
    super(programStageSection);
    this.dataElements = (programStageSection.dataElements || []).map(
      (dataElement) => new DataElement(dataElement)
    );
  }
}
