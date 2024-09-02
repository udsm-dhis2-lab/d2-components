// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class IBaseSDKModel {
  [attribute: string]: unknown;
}

export class BaseSDKModel<T extends IBaseSDKModel> {
  [attribute: string]: unknown;
  constructor(model: Partial<T>) {
    Object.keys(model).forEach((key) => {
      this[key] = model[key];
    });
  }
}
