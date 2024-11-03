// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import 'reflect-metadata';
export function D2Property(target: any, key: string) {
  if (!target.constructor._propertyMetadata) {
    target.constructor._propertyMetadata = {};
  }
  target.constructor._propertyMetadata[key] = Reflect.getMetadata(
    'design:type',
    target,
    key
  );
}
