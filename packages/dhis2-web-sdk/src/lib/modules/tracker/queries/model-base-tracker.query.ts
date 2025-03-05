// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Program, ProgramModule, ProgramRule } from '../../program';
import { D2HttpClient, D2HttpResponse, Pager } from '../../../shared';
import {
  D2TrackerResponse,
  ITrackedEntityInstance,
  ProgramDateType,
  TrackedEntityInstance,
  TrackerQueryFilter,
  TrackerUrlGenerator,
} from '../models';
import { D2Window } from '../../../d2-web-sdk';
import { BaseTrackerQuery } from './base-tracker.query';

export class ModelBaseTrackerQuery<
  T extends TrackedEntityInstance
> extends BaseTrackerQuery<T> {
  constructor(httpClient: D2HttpClient, identifiable: ITrackedEntityInstance) {
    super(httpClient);
    this.identifiable = identifiable;
    this.instance = new (identifiable as any)();
    this.setProgram(this.instance.program);
    this.setTrackedEntityType(this.instance.trackedEntityType);
  }

  byId(id: string): ModelBaseTrackerQuery<T> {
    // TODO: This is a hack to make sure attribute ID is dynamically set, find best way around this
    (this.instance as any).id = id;
    const attributeProperty = (this.instance.fields || {})['id'];

    if (!attributeProperty) {
      return this;
    }

    this.setFilters([
      new TrackerQueryFilter()
        .setAttribute(attributeProperty.id)
        .setCondition('EQ' as any)
        .setValue(id),
    ]);

    return this;
  }

  override async generateReservedValues(): Promise<
    { ownerUid: string; value: string }[]
  > {
    const fieldEntities = this.instance.fields || {};

    const reservedAttributePromises = Object.keys(fieldEntities)
      .map((key: string) => {
        const availableValue = this.instance[key];
        if (availableValue && availableValue.length > 0) {
          return null;
        }

        const field = fieldEntities[key];

        if (!field || !field.generated) {
          return null;
        }

        return this.httpClient.get(
          `trackedEntityAttributes/${field.id}/generate.json`
        );
      })
      .filter((fieldPromise) => fieldPromise !== null);

    if (reservedAttributePromises.length > 0) {
      const reservedValueResponse = await Promise.all(
        reservedAttributePromises
      );

      return (reservedValueResponse || [])
        .map((response) => response?.data as any)
        .filter((data) => data);
    }

    return [];
  }
}
