// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { camelCase, isArray } from 'lodash';
import { D2Window } from '../../../d2-web-sdk';
import {
  D2HttpClient,
  D2HttpResponse,
  generateUid,
  Pager,
  DataQueryFilter,
  ProgramDateType,
  OuMode,
  DataOrderCriteria,
} from '../../../shared';
import { Program, ProgramRule } from '../../program';
import {
  D2TrackerResponse,
  ITrackedEntityInstance,
  TrackedEntityInstance,
  TrackerUrlGenerator,
} from '../models';
import { BaseEventQuery, DHIS2Event } from '../../event';

export type TrackerFetchScope = 'TRACKED_ENTITY' | 'ENROLLMENT';

export class BaseTrackerQuery<T extends TrackedEntityInstance> {
  protected orgUnit?: string;
  protected ouMode: OuMode = 'ALL';
  protected program?: string;
  protected trackedEntityType?: string;
  protected filters?: DataQueryFilter[];
  protected fields?: string;
  protected enrollmentEnrolledAfter?: string;
  protected enrollmentEnrolledBefore?: string;
  protected trackedEntity?: string;
  protected orderCriterias?: DataOrderCriteria[];
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
    this.orgUnit = isArray(orgUnitValue)
      ? orgUnitValue.join(';')
      : orgUnitValue;

    return this;
  }

  setOuMode(ouMode: OuMode): BaseTrackerQuery<T> {
    this.ouMode = ouMode;
    return this;
  }

  setOrderCriterias(orderCriterias: DataOrderCriteria[]): BaseTrackerQuery<T> {
    this.orderCriterias = orderCriterias;
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

  setFilters(filters: DataQueryFilter[]): BaseTrackerQuery<T> {
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
      .filter((key) => {
        const field = fieldEntities[key];
        return field?.generated;
      })
      .map((key: string) => {
        const availableValue = this.instance[key];
        if (availableValue && availableValue.length > 0) {
          return null;
        }

        const field = fieldEntities[key];

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
  async get(config?: {
    fetchScope: TrackerFetchScope;
  }): Promise<D2TrackerResponse<T>> {
    const response = await this.fetchData(
      config?.fetchScope || 'TRACKED_ENTITY'
    );

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
          orgUnit: this.orgUnit,
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

  protected async fetchFromEvent(
    dataElementFilters: DataQueryFilter[],
    baseUrl: string
  ) {
    // TODO: This assumes all data element filters will be of the same program stage, there is currently no support to filter from multiple program stages
    const programStage = dataElementFilters[0].programStage;
    const attributeFilters = (this.filters || []).filter(
      (filter) => filter.attributeType === 'TRACKED_ENTITY_ATTRIBUTE'
    );

    const eventQuery = await new BaseEventQuery(this.httpClient)
      .setFields('trackedEntity')
      .setProgram(this.program as string)
      .setPagination(this.pager)
      .setOrgUnit(this.orgUnit as string)
      .setOuMode(this.ouMode)
      .setProgramStage(programStage)
      .setFilters(dataElementFilters)
      .setAttributeFilters(attributeFilters)
      .get();

    const trackedEntities = eventQuery?.data?.map(
      (event: DHIS2Event) => event.trackedEntity
    );

    if (!trackedEntities) {
      return new D2HttpResponse({});
    }

    return await this.httpClient.get(
      new TrackerUrlGenerator({
        baseEndpoint: baseUrl,
        program: this.program,
        trackedEntityType: this.trackedEntityType,
        orgUnit: this.orgUnit,
        ouMode: this.ouMode,
        filters: [],
        fields: this.fields,
        orderCriterias: this.orderCriterias,
        enrollmentEnrolledAfter: this.enrollmentEnrolledAfter,
        enrollmentEnrolledBefore: this.enrollmentEnrolledBefore,
        trackedEntity: trackedEntities.join(';'),
        pager: this.pager,
      }).generate()
    );
  }

  protected async fetchData(fetchScope: TrackerFetchScope) {
    const baseUrl =
      fetchScope === 'ENROLLMENT'
        ? 'tracker/enrollments'
        : 'tracker/trackedEntities';

    const dataElementFilters = (this.filters || []).filter(
      (filter) => filter.attributeType === 'DATA_ELEMENT'
    );

    if (dataElementFilters.length > 0) {
      return await this.fetchFromEvent(dataElementFilters, baseUrl);
    }

    return await this.httpClient.get(
      new TrackerUrlGenerator({
        baseEndpoint: baseUrl,
        program: this.program,
        trackedEntityType: this.trackedEntityType,
        orgUnit: this.orgUnit,
        ouMode: this.ouMode,
        filters: this.filters,
        fields: this.fields,
        orderCriterias: this.orderCriterias,
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
          .select([
            'id',
            'code',
            'name',
            'captureCoordinates',
            'featureType',
            'enrollmentDateLabel',
            'incidentDateLabel',
            'displayIncidentDate',
            'onlyEnrollOnce',
            'orgUnitLabel',
            'programType',
            'useFirstStageDuringRegistration',
            'trackedEntityType',
          ])
          .byId(this.program as string)
          .with(
            d2.programModule.trackedEntityType
              .select(['id', 'name'])
              .with(
                d2.programModule.trackedEntityTypeAttribute.select([
                  'trackedEntityAttribute',
                ])
              ),
            'ToOne'
          )
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
              .select([
                'id',
                'programRuleActionType',
                'data',
                'displayContent',
                'content',
              ])
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
              .with(
                d2.optionSetModule.optionGroup
                  .select(['id'])
                  .with(
                    d2.optionSetModule.option.select([
                      'id',
                      'code',
                      'displayName',
                    ]),
                    'ToMany'
                  ),
                'ToOne'
              )
              .with(
                d2.optionSetModule.option.select(['id', 'code', 'displayName']),
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
