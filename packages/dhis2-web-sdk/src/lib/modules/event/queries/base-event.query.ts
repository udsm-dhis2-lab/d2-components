import { D2HttpClient, DataQueryFilter, OuMode, Pager } from '../../../shared';
import {
  D2EventResponse,
  DHIS2Event,
  EventUrlGenerator,
  IDHIS2Event,
} from '../models';
import { AssignedUserMode, EventDateType } from '../interfaces';

export class BaseEventQuery<T extends DHIS2Event> {
  protected orgUnit?: string;
  protected ouMode: OuMode = 'ALL';
  protected program?: string;
  protected programStage?: string;
  protected filters?: DataQueryFilter[];
  protected fields?: string;
  protected event?: string;
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

  /**
   * @deprecated
   * @param event
   * @returns
   */
  byEventId(event: string): BaseEventQuery<T> {
    this.event = event;
    return this;
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

    return new D2EventResponse<T>(response, this.identifiable);
  }

  async save(): Promise<D2EventResponse<T>> {
    const data = await this.httpClient.post('tracker?async=false', {
      events: [this.instance!.toObject()],
    });

    return new D2EventResponse<T>(data, this.identifiable);
  }
}
