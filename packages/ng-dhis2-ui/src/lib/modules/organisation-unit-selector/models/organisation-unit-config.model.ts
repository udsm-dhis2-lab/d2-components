// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export type OrganisationUnitSelectionUsageType = 'DATA_ENTRY' | 'DATA_VIEW';
export class OrganisationUnitSelectionConfig {
  hideGroupSelect!: boolean;
  hideLevelSelect!: boolean;
  hideUserOrgUnits!: boolean;
  usageType!: OrganisationUnitSelectionUsageType;
  minLevel?: number;
  allowSingleSelection?: boolean;
  batchSize?: number;
  additionalQueryFields?: string[];
  allowCaching?: boolean;

  constructor(params?: Partial<OrganisationUnitSelectionConfig>) {
    this.hideGroupSelect = params?.hideGroupSelect || false;
    this.hideLevelSelect = params?.hideLevelSelect || false;
    this.hideUserOrgUnits = params?.hideUserOrgUnits || false;
    this.usageType = params?.usageType || 'DATA_ENTRY';
    this.minLevel = params?.minLevel;
    this.allowSingleSelection = params?.allowSingleSelection || false;
    this.batchSize = params?.batchSize;
    this.additionalQueryFields = params?.additionalQueryFields;
    this.allowCaching = params?.allowCaching;
  }
}
