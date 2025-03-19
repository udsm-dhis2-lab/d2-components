// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { TrackedEntityInstance } from '../../modules/tracker/models';

export function OrgUnitField(options?: {
  useName?: boolean;
}): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        const instance = this as TrackedEntityInstance;
        if (instance.setOrgUnit) instance.setOrgUnit(newValue);
      },
      get() {
        const instance = this as TrackedEntityInstance;
        return options?.useName
          ? instance.latestEnrollment?.orgUnitName
          : instance.orgUnit;
      },
    };

    return adjustedDescripter;
  };
}
