// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { Program, ProgramModule, ProgramRule } from '../../program';
import {
  D2HttpClient,
  D2HttpResponse,
  generateCodes,
  generateUid,
  Pager,
} from '../../../shared';
import {
  D2TrackerResponse,
  ITrackedEntityInstance,
  ProgramDateType,
  TrackedEntityInstance,
  TrackerQueryFilter,
  TrackerUrlGenerator,
} from '../models';
import { D2Window } from '../../../d2-web-sdk';
import { DataElement } from '../../data-element';
import { camelCase } from 'lodash';

export class BaseTrackerQuery<T extends TrackedEntityInstance> {
  protected orgUnit?: string;
  protected ouMode: 'ALL' | 'DESCENDANTS' | 'SELECTED' = 'ALL';
  protected program?: string;
  protected trackedEntityType?: string;
  protected filters?: TrackerQueryFilter[];
  protected fields?: string;
  protected enrollmentEnrolledAfter?: string;
  protected enrollmentEnrolledBefore?: string;
  protected trackedEntity?: string;
  event?: string;
  protected pager = new Pager();
  [key: string]: unknown;
  instance!: T;
  identifiable: ITrackedEntityInstance;
  constructor(protected httpClient: D2HttpClient) {
    this.identifiable =
      TrackedEntityInstance as unknown as ITrackedEntityInstance;
  }

  setOrgUnit(orgUnitValue: string | string[]): BaseTrackerQuery<T> {
    if (orgUnitValue) {
      this.orgUnit =
        typeof orgUnitValue === 'object'
          ? orgUnitValue.join(';')
          : (orgUnitValue as string);
    }

    return this;
  }

  setOuMode(ouMode: 'ALL' | 'DESCENDANTS' | 'SELECTED'): BaseTrackerQuery<T> {
    this.ouMode = ouMode;
    return this;
  }

  setProgram(program: string): BaseTrackerQuery<T> {
    this.program = program;
    return this;
  }

  setStartDate(
    startDate: string,
    dateType: ProgramDateType = 'ENROLLED_ON'
  ): BaseTrackerQuery<T> {
    switch (dateType) {
      case 'ENROLLED_ON':
        this.enrollmentEnrolledAfter = startDate;
        break;

      default:
        break;
    }

    return this;
  }

  setEndDate(
    endDate: string,
    dateType: ProgramDateType = 'ENROLLED_ON'
  ): BaseTrackerQuery<T> {
    switch (dateType) {
      case 'ENROLLED_ON':
        this.enrollmentEnrolledBefore = endDate;
        break;

      default:
        break;
    }

    return this;
  }
  setTrackedEntity(trackedEntity: string): BaseTrackerQuery<T> {
    this.trackedEntity = trackedEntity;
    return this;
  }

  setTrackedEntities(trackedEntities: string[]): BaseTrackerQuery<T> {
    this.trackedEntity = trackedEntities.join(';');
    return this;
  }

  setTrackedEntityType(trackedEntityType: string): BaseTrackerQuery<T> {
    this.trackedEntityType = trackedEntityType;
    return this;
  }

  setFilters(filters: TrackerQueryFilter[]): BaseTrackerQuery<T> {
    this.filters = filters;
    return this;
  }

  setFields(fields: string): BaseTrackerQuery<T> {
    this.fields = fields;
    return this;
  }

  setPagination(pagination: Pager): BaseTrackerQuery<T> {
    this.pager = pagination;
    return this;
  }

  setData(data: T): BaseTrackerQuery<T> {
    this.instance = data;
    return this;
  }

  byEventId(event: string): BaseTrackerQuery<T> {
    this.event = event;
    return this;
  }

  async generateReservedValues(): Promise<
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
  async get(): Promise<D2TrackerResponse<T>> {
    const response = await this.fetchData();

    return new D2TrackerResponse<T>(response, this.identifiable);
  }

  async create(): Promise<T> {
    if (!this.instance) {
      const program = await this.getMetaData();

      if (program) {
        this.instance = new (this.identifiable as any)({
          trackedEntity: generateUid(),
          trackedEntityType: program.trackedEntityType?.id,
          program: program.id,
        });

        this.instance.fields = {
          ...(this.instance.fields || {}),
          ...(program.dataElements || []).reduce((fieldObject, dataElement) => {
            const key = dataElement.code
              ? camelCase(dataElement.code)
              : dataElement.id;
            return {
              ...fieldObject,
              [key]: {
                id: dataElement.id,
                type: 'DATA_ELEMENT',
                stageId: dataElement.programStageId,
              },
            };
          }, {}),
          ...(program.trackedEntityAttributes || []).reduce(
            (fieldObject, trackedEntityAttribute) => {
              const key = trackedEntityAttribute.code
                ? camelCase(trackedEntityAttribute.code)
                : trackedEntityAttribute.id;
              return {
                ...fieldObject,
                [key]: {
                  id: trackedEntityAttribute.id,
                  type: 'ATTRIBUTE',
                  generated: trackedEntityAttribute.generated,
                },
              };
            },
            {}
          ),
        };

        const reservedValues = await this.generateReservedValues();

        (reservedValues || []).forEach((reserved) => {
          this.instance.setAttributeValue(reserved.ownerUid, reserved.value);
        });
      }
    }

    return this.instance;
  }

  protected async fetchData() {
    return await this.httpClient.get(
      new TrackerUrlGenerator({
        program: this.program,
        trackedEntityType: this.trackedEntityType,
        orgUnit: this.orgUnit,
        ouMode: this.ouMode,
        filters: this.filters,
        fields: this.fields,
        enrollmentEnrolledAfter: this.enrollmentEnrolledAfter,
        enrollmentEnrolledBefore: this.enrollmentEnrolledBefore,
        trackedEntity: this.trackedEntity,
        pager: this.pager,
      }).generate()
    );
  }

  async #saveSelectedEvent(): Promise<D2TrackerResponse<T>> {
    const selectedEvent = (this.instance.latestEnrollment?.events || []).find(
      (event) => event.event === this.event
    );

    if (selectedEvent) {
      const response = new D2HttpResponse({});
      return new D2TrackerResponse<T>(response, this.identifiable);
    }

    const data = await this.httpClient.post('tracker?async=false', {
      events: [selectedEvent!.toObject()],
    });

    return new D2TrackerResponse<T>(data, this.identifiable);
  }

  async #saveAll() {
    const reservedValues = await this.generateReservedValues();

    (reservedValues || []).forEach((reserved) => {
      this.instance.setAttributeValue(reserved.ownerUid, reserved.value);
    });

    const data = await this.httpClient.post('tracker?async=false', {
      trackedEntities: [this.instance.toObject!()],
    });

    return new D2TrackerResponse<T>(data, this.identifiable);
  }

  async save(): Promise<D2TrackerResponse<T>> {
    if (this.event) {
      return this.#saveSelectedEvent();
    }

    return this.#saveAll();
  }

  async getMetaData(): Promise<Program | null> {
    try {
      const d2 = (window as unknown as D2Window).d2Web;
      const metaDataResponse = await Promise.all([
        d2.programModule.program
          .byId(this.program as string)
          .with(
            d2.programModule.programStage
              .with(d2.programModule.programStageSection)
              .with(
                d2.programModule.programStageDataElement.with(
                  d2.dataElementModule.dataElement.with(
                    d2.optionSetModule.optionSet.with(
                      d2.optionSetModule.option
                    ),
                    'ToOne'
                  ),
                  'ToOne'
                )
              )
          )
          .with(
            d2.programModule.programSection.with(
              d2.programModule.trackedEntityAttribute.select(['id'])
            )
          )
          .with(
            d2.programModule.programRuleVariable
              .with(
                d2.dataElementModule.dataElement.select(['id', 'code', 'name']),
                'ToOne'
              )
              .with(
                d2.programModule.trackedEntityAttribute.select([
                  'id',
                  'code',
                  'name',
                ]),
                'ToOne'
              )
          )
          .with(
            d2.programModule.programTrackedEntityAttribute.with(
              d2.programModule.trackedEntityAttribute.with(
                d2.optionSetModule.optionSet.with(d2.optionSetModule.option),
                'ToOne'
              ),
              'ToOne'
            )
          )
          .get(),
        d2.programModule.programRule
          .where({
            attribute: 'program.id' as any,
            value: this.program as string,
          })
          .with(
            d2.programModule.programRuleAction
              .with(
                d2.dataElementModule.dataElement.select(['id', 'code', 'name']),
                'ToOne'
              )
              .with(
                d2.programModule.trackedEntityAttribute.select([
                  'id',
                  'code',
                  'name',
                ]),
                'ToOne'
              )
          )
          .get(),
      ]);

      const [programResponse, programRuleResponse] = metaDataResponse;

      const metaData = programResponse.data as Program;
      metaData.programRules = programRuleResponse.data as ProgramRule[];

      return metaData;
    } catch (error) {
      return null;
    }
  }
}
