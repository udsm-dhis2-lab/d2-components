// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { TableRow } from './line-list.models';
import { DropdownMenuOption } from './dropdown-menu.model';

export interface LineListActionOption extends DropdownMenuOption {
  onClick?: (tableRow: TableRow) => void;
}
