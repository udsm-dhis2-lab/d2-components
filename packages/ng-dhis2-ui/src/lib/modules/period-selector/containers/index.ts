// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { PeriodSelectorModalComponent } from 'packages/ng-dhis2-ui/src/lib/modules/period-selector/containers/period-selector-modal/period-selector-modal.component';
import { PeriodSelectorComponent } from './period-selector/period-selector.component';

export const periodContainers: any = [
  PeriodSelectorComponent,
  PeriodSelectorModalComponent,
];

export { PeriodSelectorComponent, PeriodSelectorModalComponent };
