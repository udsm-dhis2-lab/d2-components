import { camelCase } from 'lodash';
import { D2Window } from '../../../d2-web-sdk';
import { D2HttpClient, DataQueryFilter, OuMode, Pager } from '../../../shared';
import { Program, ProgramRule } from '../../program';
import {
  AssignedUserMode,
  EventDateType,
  EventFieldProperty,
} from '../interfaces';
import {
  D2EventResponse,
  DHIS2Event,
  EventUrlGenerator,
  IDHIS2Event,
} from '../models';

export class BaseEventQuery<T extends DHIS2Event> {
  protected orgUnit?: string;
  protected ouMode: OuMode = 'ALL';
  protected program?: string;
  protected programStage?: string;
  protected filters?: DataQueryFilter[];
  protected fields?: string;
  protected event?: string;
  protected trackedEntity?: string;
  protected enrollment?: string;
  protected occurredBefore?: string;
  protected occurredAfter?: string;
  protected scheduledBefore?: string;
  protected scheduledAfter?: string;
  protected assignedUser?: string;
  protected assignedUserMode?: AssignedUserMode;
  protected enrollmentEnrolledBefore?: string;
  protected enrollmentEnrolledAfter?: string;
  pager = new Pager();
  [key: string]: unknown;
  instance!: T;
  identifiable: IDHIS2Event;
  constructor(protected httpClient: D2HttpClient) {
    this.identifiable = DHIS2Event as unknown as IDHIS2Event;
  }

  setOrgUnit(orgUnitValue: string | string[]): BaseEventQuery<T> {
    if (orgUnitValue) {
      this.orgUnit =
        typeof orgUnitValue === 'object'
          ? orgUnitValue.join(';')
          : (orgUnitValue as string);
    }

    return this;
  }

  setOuMode(ouMode: OuMode): BaseEventQuery<T> {
    this.ouMode = ouMode;
    return this;
  }

  setProgram(program: string): BaseEventQuery<T> {
    this.program = program;
    return this;
  }

  setProgramStage(programStage: string): BaseEventQuery<T> {
    this.programStage = programStage;
    return this;
  }

  setStartDate(
    startDate: string,
    dateType: EventDateType = 'OCCURED_ON'
  ): BaseEventQuery<T> {
    switch (dateType) {
      case 'OCCURED_ON':
        this.occurredAfter = startDate;
        break;

      case 'SCHEDULED_ON':
        this.scheduledAfter = startDate;
        break;

      case 'ENROLLED_ON':
        this.enrollmentEnrolledAfter = startDate;
        break;

      default:
        break;
    }

    return this;
  }

  setEndDate(endDate: string, dateType = 'OCCURED_ON'): BaseEventQuery<T> {
    switch (dateType) {
      case 'OCCURED_ON':
        this.occurredBefore = endDate;
        break;

      case 'SCHEDULED_ON':
        this.scheduledBefore = endDate;
        break;

      case 'ENROLLED_ON':
        this.enrollmentEnrolledBefore = endDate;
        break;

      default:
        break;
    }

    return this;
  }

  setFilters(filters: DataQueryFilter[]): BaseEventQuery<T> {
    this.filters = filters;
    return this;
  }

  setFields(fields: string): BaseEventQuery<T> {
    this.fields = fields;
    return this;
  }

  setPagination(pagination: Pager): BaseEventQuery<T> {
    this.pager = pagination;
    return this;
  }

  setData(data: T): BaseEventQuery<T> {
    this.instance = data;
    return this;
  }

  setEvent(event: string): BaseEventQuery<T> {
    this.event = event;
    return this;
  }
  setTrackedEntity(trackedEntity: string): BaseEventQuery<T> {
    this.trackedEntity = trackedEntity;
    return this;
  }
  setEnrollment(enrollment: string): BaseEventQuery<T> {
    this.enrollment = enrollment;
    return this;
  }

  /**
   * @deprecated
   * @param event
   * @returns
   */
  byEventId(event: string): BaseEventQuery<T> {
    this.event = event;
    return this;
  }

  async create(): Promise<T> {
    if (!this.instance) {
      const program = await this.getMetaData();

      if (program) {
        this.instance = new (this.identifiable as any)(
          {
            trackedEntity: this.trackedEntity,
            enrollment: this.enrollment,
            program: this.program,
            programStage: this.programStage,
            orgUnit: this.orgUnit,
          },
          { generateIdIfNotExists: true }
        );

        this.instance.fields = this.#getFields(program, this.instance);
      }
    }

    return this.instance;
  }

  #getFields(
    program: Program,
    instance: T
  ): Record<string, EventFieldProperty> {
    return {
      ...(instance.fields || {}),
      ...(program.dataElements || [])
        .filter(
          (dataElement) => dataElement.programStageId === this.programStage
        )
        .reduce((fieldObject, dataElement) => {
          const key = dataElement.code
            ? camelCase(dataElement.code)
            : dataElement.id;
          return {
            ...fieldObject,
            [key]: {
              id: dataElement.id,
              type: 'DATA_ELEMENT',
            },
          };
        }, {}),
    };
  }

  async get(): Promise<D2EventResponse<T>> {
    const response = await this.httpClient.get(
      new EventUrlGenerator({
        program: this.program,
        programStage: this.programStage,
        event: this.event,
        assignedUser: this.assignedUser,
        assignedUserMode: this.assignedUserMode,
        orgUnit: this.orgUnit,
        ouMode: this.ouMode,
        filters: this.filters,
        fields: this.fields,
        enrollmentEnrolledAfter: this.enrollmentEnrolledAfter,
        enrollmentEnrolledBefore: this.enrollmentEnrolledBefore,
        occurredAfter: this.occurredAfter,
        occurredBefore: this.occurredBefore,
        scheduledAfter: this.scheduledAfter,
        scheduledBefore: this.scheduledBefore,
        pager: this.pager,
      }).generate()
    );

    const eventResponse = new D2EventResponse<T>(response, this.identifiable);

    if (eventResponse.data && eventResponse.data instanceof DHIS2Event) {
      const program = await this.getMetaData();
      if (program) {
        (eventResponse.data as T).fields = this.#getFields(
          program,
          eventResponse.data as T
        );
      }
    }

    return eventResponse;
  }

  async save(): Promise<D2EventResponse<T>> {
    const data = await this.httpClient.post('tracker?async=false', {
      events: [this.instance!.toObject()],
    });

    return new D2EventResponse<T>(data, this.identifiable);
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
