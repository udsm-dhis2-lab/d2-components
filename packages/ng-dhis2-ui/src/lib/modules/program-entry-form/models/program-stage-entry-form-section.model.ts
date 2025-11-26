// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { IFormField } from "../../form/interfaces/form-field.interface";

export interface IProgramStageEntryFormSection {
  id: string;
  name: string;
  description?: string;
  formFields: IFormField<string>[];
  orientation: 'HORIZONTAL' | 'VERTICAL';
}

export class ProgramStageEntryFormSection implements IProgramStageEntryFormSection {
  id!: string;
  name!: string;
  description?: string;
  formFields: IFormField<string>[] = [];
  orientation: 'HORIZONTAL' | 'VERTICAL' = 'HORIZONTAL';

  constructor(props: IProgramStageEntryFormSection) {
    Object.assign(this, props);
  }
}
