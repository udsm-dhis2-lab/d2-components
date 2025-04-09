// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export function TrackedEntityDecorator(params: {
  program: string;
  trackedEntityType: string;
}) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (constructor: Function) {
    constructor.prototype.program = params.program;
    constructor.prototype.trackedEntityType = params.trackedEntityType;
  };
}
