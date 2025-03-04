import { D2HttpClient, D2HttpResponse, Pager } from '../../../shared';
import {
  D2EventResponse,
  DHIS2Event,
  IDHIS2Event,
  ITrackedEntityInstance,
  ProgramDateType,
  TrackedEntityInstance,
  TrackerQueryFilter,
  TrackerUrlGenerator,
} from '../models';

export class BaseEventQuery<T extends DHIS2Event> {
  #orgUnit?: string;
  #ouMode: 'ALL' | 'DESCENDANTS' | 'SELECTED' = 'ALL';
  #program?: string;
  #filters?: TrackerQueryFilter[];
  #fields?: string;
  event?: string;
  #pager = new Pager();
  [key: string]: unknown;
  instance!: T;
  constructor(
    protected identifiable: IDHIS2Event,
    protected httpClient: D2HttpClient
  ) {
    this.instance = new (identifiable as any)();
  }

  setOrgUnit(orgUnitValue: string | string[]): BaseEventQuery<T> {
    if (orgUnitValue) {
      this.#orgUnit =
        typeof orgUnitValue === 'object'
          ? orgUnitValue.join(';')
          : (orgUnitValue as string);
    }

    return this;
  }

  setOuMode(ouMode: 'ALL' | 'DESCENDANTS' | 'SELECTED'): BaseEventQuery<T> {
    this.#ouMode = ouMode;
    return this;
  }

  setProgram(program: string): BaseEventQuery<T> {
    this.#program = program;
    return this;
  }

  setStartDate(startDate: string, dateType = 'OCCURED_AT'): BaseEventQuery<T> {
    switch (dateType) {
      case 'OCCURED_AT':
        // this.#enrollmentEnrolledAfter = startDate;
        break;

      default:
        break;
    }

    return this;
  }

  setEndDate(endDate: string, dateType = 'OCCURED_AT'): BaseEventQuery<T> {
    switch (dateType) {
      case 'OCCURED_AT':
        // this.#enrollmentEnrolledBefore = endDate;
        break;

      default:
        break;
    }

    return this;
  }

  setFilters(filters: TrackerQueryFilter[]): BaseEventQuery<T> {
    this.#filters = filters;
    return this;
  }

  setFields(fields: string): BaseEventQuery<T> {
    this.#fields = fields;
    return this;
  }

  setPagination(pagination: Pager): BaseEventQuery<T> {
    this.#pager = pagination;
    return this;
  }

  setData(data: T): BaseEventQuery<T> {
    this.instance = data;
    return this;
  }

  byEventId(event: string): BaseEventQuery<T> {
    this.event = event;
    return this;
  }

  // async get(): Promise<D2EventResponse<T>> {
  //   const response = await this.httpClient.get(
  //     new TrackerUrlGenerator({
  //       program: this.#program,
  //       trackedEntityType: this.#trackedEntityType,
  //       orgUnit: this.#orgUnit,
  //       ouMode: this.#ouMode,
  //       filters: this.#filters,
  //       fields: this.#fields,
  //       enrollmentEnrolledAfter: this.#enrollmentEnrolledAfter,
  //       enrollmentEnrolledBefore: this.#enrollmentEnrolledBefore,
  //       trackedEntity: this.#trackedEntity,
  //       pager: this.#pager,
  //     }).generate()
  //   );

  //   return new D2EventResponse<T>(response, this.identifiable);
  // }

  async save(): Promise<D2EventResponse<T>> {
    const data = await this.httpClient.post('tracker?async=false', {
      events: [this.instance!.toObject()],
    });

    return new D2EventResponse<T>(data, this.identifiable);
  }
}
