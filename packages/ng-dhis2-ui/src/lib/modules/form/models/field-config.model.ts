// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class FieldConfig {
  hideLabel?: boolean;
  inputWidth: string;

  constructor(config?: Partial<FieldConfig>) {
    this.hideLabel = config?.hideLabel ?? false;
    this.inputWidth = config?.inputWidth || '100%';
  }
}
