// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DHIS2Event, TrackedEntityInstance } from '@iapps/d2-web-sdk';
import { DropdownMenuOption } from './dropdown-menu.model';

export interface LineListActionOption extends DropdownMenuOption {
  onClick?: (tableRow: TrackedEntityInstance | DHIS2Event) => void;
}
