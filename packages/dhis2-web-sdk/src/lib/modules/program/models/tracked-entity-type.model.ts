// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  IDENTIFIABLE_FIELDS,
  IdentifiableField,
  IdentifiableObject,
} from '../../../shared';
import { TrackedEntityTypeAttribute } from './tracked-entity-type-attribute.model';

export type TrackedEntityTypeField =
  | IdentifiableField
  | 'trackedEntityTypeAttributes'
  | 'featureType'
  | 'minAttributesRequiredToSearch'
  | 'maxTeiCountToReturn'
  | 'allowAuditLog'
  | 'description'
  | 'displayDescription'
  | 'displayFormName';

export class TrackedEntityType extends IdentifiableObject<TrackedEntityType> {
  static resourceName = 'trackedEntityTypes';
  static singularResourceName = 'trackedEntityType';

  // TODO: Use class reflection
  static fields: TrackedEntityTypeField[] = [
    ...IDENTIFIABLE_FIELDS,
    'trackedEntityTypeAttributes',
    'featureType',
    'minAttributesRequiredToSearch',
    'maxTeiCountToReturn',
    'allowAuditLog',
    'description',
    'displayDescription',
    'displayFormName',
  ];

  trackedEntityTypeAttributes!: TrackedEntityTypeAttribute[];
  featureType!: string;
  minAttributesRequiredToSearch!: number;
  maxTeiCountToReturn!: number;
  allowAuditLog!: boolean;
  displayDescription!: string;
  displayFormName!: string;

  constructor(trackedEntityType: Partial<TrackedEntityType>) {
    super(trackedEntityType);

    this.trackedEntityTypeAttributes = this.#getTrackedEntityTypeAttributes(
      trackedEntityType.trackedEntityTypeAttributes || []
    );
  }

  #getTrackedEntityTypeAttributes(
    trackedEntityTypeAttributes: Partial<TrackedEntityTypeAttribute>[]
  ) {
    return (trackedEntityTypeAttributes || []).map(
      (trackedEntityTypeAttribute) =>
        new TrackedEntityTypeAttribute(trackedEntityTypeAttribute)
    );
  }
}
