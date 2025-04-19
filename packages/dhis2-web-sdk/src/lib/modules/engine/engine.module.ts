// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ProgramRuleEngine } from './program-rule';

export class D2EngineModule {
  get programRule() {
    return new ProgramRuleEngine();
  }
}
