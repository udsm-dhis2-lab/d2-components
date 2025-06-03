// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { isArray } from 'lodash';
import { D2Window } from '../../../d2-web-sdk';
import {
  D2HttpClient,
  D2HttpResponse,
  DataOrderCriteria,
  DataQueryFilter,
  EnrollmentStatus,
  EventStatus,
  generateUid,
  OuMode,
  Pager,
  ProgramDateType,
} from '../../../shared';
import { BaseEventQuery, DHIS2Event } from '../../event';
import { Program, ProgramRule } from '../../program';
import {
  D2TrackerResponse,
  ITrackedEntityInstance,
  TrackedEntityInstance,
  TrackerQueryConfig,
  TrackerUrlGenerator,
} from '../models';

export type TrackerFetchScope = 'TRACKED_ENTITY' | 'ENROLLMENT';

export class BaseTrackerQuery<T extends TrackedEntityInstance> {
  protected orgUnit?: string;
  protected ouMode: OuMode = 'ALL';
  protected program?: string;
  protected programStage?: string;
  protected trackedEntityType?: string;
  protected filters?: DataQueryFilter[];
  protected fields?: string;
  protected enrollmentEnrolledAfter?: string;
  protected enrollmentEnrolledBefore?: string;
  protected trackedEntity?: string;
  protected orderCriterias?: DataOrderCriteria[];
  protected enrollmentStatus?: EnrollmentStatus;
  protected eventStatus?: EventStatus;
  protected config?: TrackerQueryConfig;
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

  setStatus(
    status: EnrollmentStatus | EventStatus,
    statusType: 'ENROLLMENT' | 'EVENT' = 'ENROLLMENT'
  ): BaseTrackerQuery<T> {
    if (statusType === 'ENROLLMENT') {
      this.enrollmentStatus = status as EnrollmentStatus;
    }

    if (statusType === 'EVENT') {
      this.eventStatus = status as EventStatus;
    }

    return this;
  }

  setEventStatus(
    status: EventStatus,
    programStage: string
  ): BaseTrackerQuery<T> {
    this.programStage = programStage;
    return this.setStatus(status, 'EVENT');
  }

  setOrderCriterias(orderCriterias: DataOrderCriteria[]): BaseTrackerQuery<T> {
    this.orderCriterias = orderCriterias;
    return this;
  }

  setProgram(program: string): BaseTrackerQuery<T> {
    this.program = program;
    return this;
  }

  setProgramStage(programStage: string): BaseTrackerQuery<T> {
    this.programStage = programStage;
    return this;
  }

  setConfig(config: TrackerQueryConfig): BaseTrackerQuery<T> {
    this.config = config;
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

  async generateReservedValues(
    instance: T
  ): Promise<{ ownerUid: string; value: string }[]> {
    const fieldEntities = instance.fields || {};

    const reservedAttributePromises = Object.keys(fieldEntities)
      .filter((key) => {
        const field = fieldEntities[key];
        return field?.generated;
      })
      .map(async (key: string) => {
        const availableValue = instance[key];
        if (availableValue && availableValue.length > 0) {
          return null;
        }

        const field = fieldEntities[key];

        if (field.pattern?.includes('ORG_UNIT_CODE')) {
          if (!this.orgUnit) {
            return null;
          }

          const orgUnit = (
            await this.httpClient.get(
              `organisationUnits/${this.orgUnit}.json?fields=code`
            )
          )?.data as { code: string };

          if (!orgUnit?.code) {
            return null;
          }

          return this.httpClient.get(
            `trackedEntityAttributes/${field.id}/generate.json?ORG_UNIT_CODE=${orgUnit.code}`
          );
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
  async get(config?: {
    fetchScope: TrackerFetchScope;
  }): Promise<D2TrackerResponse<T>> {
    const response = await this.fetchData(
      config?.fetchScope || 'TRACKED_ENTITY'
    );

    const trackerResponse = new D2TrackerResponse<T>(
      response,
      this.identifiable,
      this.program
    );

    if (trackerResponse?.data instanceof TrackedEntityInstance) {
      this.instance = trackerResponse.data;
    }

    return trackerResponse;
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

        const autoGeneratedProgramStages = (program.programStages || []).filter(
          (programStage) => programStage.autoGenerateEvent
        );

        if (autoGeneratedProgramStages.length > 0) {
          autoGeneratedProgramStages.forEach((programStage) => {
            const event = new DHIS2Event(
              {
                program: this.program,
                programStage: programStage.id,
                orgUnit: this.orgUnit,
              },
              {
                generateIdIfNotExists: programStage.preGenerateUID,
              }
            );
            this.instance.setEvent(event);
          });
        }

        this.setInstanceFields(program);

        await this.setReservedValues();
      }
    }

    return this.instance;
  }

  async setReservedValues(): Promise<T> {
    const reservedValues = await this.generateReservedValues(this.instance);

    (reservedValues || []).forEach((reserved) => {
      this.instance.setAttributeValue(reserved.ownerUid, reserved.value);
    });

    return this.instance;
  }

  setInstanceFields(program: Program): BaseTrackerQuery<T> {
    this.instance.setFields(program);
    return this;
  }

  protected async fetchFromEvent(
    dataElementFilters: DataQueryFilter[],
    baseUrl: string
  ) {
    // TODO: This assumes all data element filters will be of the same program stage, there is currently no support to filter from multiple program stages
    const programStage =
      dataElementFilters[0]?.programStage ?? this.programStage;
    const attributeFilters = (this.filters || []).filter(
      (filter) => filter.attributeType === 'TRACKED_ENTITY_ATTRIBUTE'
    );

    const eventQuery = await new BaseEventQuery(this.httpClient)
      .setFields('trackedEntity')
      .setStartDate(this.enrollmentEnrolledAfter as string)
      .setEndDate(this.enrollmentEnrolledBefore as string)
      .setProgram(this.program as string)
      .setPagination(this.pager)
      .setOrgUnit(this.orgUnit as string)
      .setOuMode(this.ouMode)
      .setProgramStage(programStage)
      .setFilters(dataElementFilters)
      .setAttributeFilters(attributeFilters)
      .setStatus(this.eventStatus as EventStatus)
      .get();

    const trackedEntities = eventQuery?.data?.map(
      (event: DHIS2Event) => event.trackedEntity
    );

    if (!trackedEntities || trackedEntities.length === 0) {
      const eventResponse = new D2HttpResponse({});
      eventResponse.responseStatus = eventQuery.responseStatus;
      eventResponse.data = {
        ...eventQuery?.pagination,
        trackedEntities: [],
      };

      return eventResponse;
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
        enrollmentStatus: this.enrollmentStatus,
        enrollmentEnrolledAfter: this.enrollmentEnrolledAfter,
        enrollmentEnrolledBefore: this.enrollmentEnrolledBefore,
        trackedEntity: trackedEntities.join(';'),
        pager: this.pager,
        preferList: true,
        config: this.config,
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

    if (dataElementFilters.length > 0 || this.eventStatus) {
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
        enrollmentStatus: this.enrollmentStatus,
        enrollmentEnrolledAfter: this.enrollmentEnrolledAfter,
        enrollmentEnrolledBefore: this.enrollmentEnrolledBefore,
        trackedEntity: this.trackedEntity,
        pager: this.pager,
        config: this.config,
      }).generate()
    );
  }

  async #saveSelectedEvent(): Promise<D2TrackerResponse<T>> {
    const selectedEvent = (this.instance.latestEnrollment?.events || []).find(
      (event) => event.event === this.event
    );

    if (selectedEvent) {
      const response = new D2HttpResponse({});
      return new D2TrackerResponse<T>(
        response,
        this.identifiable,
        this.program
      );
    }

    const data = await this.httpClient.post('tracker?async=false', {
      events: [selectedEvent!.toObject()],
    });

    return new D2TrackerResponse<T>(data, this.identifiable, this.program);
  }

  async #saveAll() {
    const data = await this.httpClient.post('tracker?async=false', {
      trackedEntities: [this.instance.toObject!()],
    });

    return new D2TrackerResponse<T>(data, this.identifiable, this.program);
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
