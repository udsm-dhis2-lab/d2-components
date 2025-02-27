// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isArray, isEmpty } from 'lodash';
import {
  DHIS2Event,
  TrackedEntityInstance,
  TrackerRelationship,
} from '../models';
import { generateUid } from '../../../shared';

export function RelationshipField(
  relationshipType: string,
  RelationshipClass?: typeof TrackedEntityInstance | typeof DHIS2Event,
  multiple?: boolean
): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, relationship: TrackerRelationship | TrackerRelationship[]) {
        if (!isEmpty(relationship)) {
          const instance = this as TrackedEntityInstance;

          if (isArray(relationship)) {
            relationship.forEach((relationshipItem) => {
              if (!relationshipItem.relationship) {
                relationshipItem.relationship = generateUid();
              }

              if (!relationshipItem.relationDirection) {
                relationshipItem.relationDirection = 'TO';
              }
              relationshipItem.relationshipType = relationshipType;
              instance.setRelationship!(relationshipItem);
            });
          } else {
            if (!relationship.relationship) {
              relationship.relationship = generateUid();
            }

            if (!relationship.relationDirection) {
              relationship.relationDirection = 'FROM';
            }

            relationship.relationshipType = relationshipType;
            instance.setRelationship!(relationship);
          }
        }
      },
      get() {
        const instance = this as TrackedEntityInstance;
        const relationships = (instance.relatedEntities || []).filter(
          (relatedEntity) => relatedEntity.relationshipType === relationshipType
        );

        if (RelationshipClass) {
          return multiple
            ? relationships.map(
                (relationship) => new RelationshipClass(relationship)
              )
            : new RelationshipClass((relationships || [])[0] || {});
        }

        return relationships;
      },
    };

    return adjustedDescripter;
  };
}
