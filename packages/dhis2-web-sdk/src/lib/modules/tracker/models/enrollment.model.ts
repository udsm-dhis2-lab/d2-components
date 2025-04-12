import { cloneDeep, groupBy } from 'lodash';
import { EventUtil } from '../../event/utils/event.util';
import { BaseTrackerSDKModel } from './base.model';
import { DataValue, DataValueUtil } from '../../event/models/data-value.model';
import { DHIS2Event, IDHIS2Event } from '../../event/models/event.model';
import { AttributeUtil } from '../utils';

export interface IEnrollment {
  storedBy?: string;
  created?: string;
  orgUnit: string;
  createdAtClient?: string;
  program: string;
  trackedEntity: string;
  enrollment: string;
  lastUpdated?: string;
  trackedEntityType?: string;
  lastUpdatedAtClient?: string;
  orgUnitName?: string;
  enrolledAt?: string;
  enrollmentDate?: string;
  deleted?: boolean;
  occurredAt: string;
  incidentDate?: string;
  status?: string;
  notes?: any[];
  relationships?: any[];
  attributes?: any[];
  events: IDHIS2Event[];
  eventEntities?: Record<string, Record<string, DataValue>>;
  programStageEvents?: Record<
    string,
    {
      events: IDHIS2Event[];
      pristine: boolean;
    }
  >;
  setProgramStageData?: (
    key: string,
    dataEntities: Record<string, any>[]
  ) => void;

  setEvent?: (event: IDHIS2Event) => void;

  setGeometry?: (geometry: Record<string, any>) => void;

  getEventsByProgramStage?: (programStage: string) => IDHIS2Event[];
  toObject?: () => IEnrollment;
}
export class Enrollment
  extends BaseTrackerSDKModel<Enrollment>
  implements IEnrollment
{
  enrollment!: string;
  storedBy?: string;
  created?: string;
  orgUnit!: string;
  geometry: any;
  createdAtClient?: string;
  program!: string;
  trackedEntity!: string;
  lastUpdated?: string;
  trackedEntityType?: string;
  lastUpdatedAtClient?: string;
  orgUnitName?: string;
  enrolledAt!: string;
  enrollmentDate?: string;
  deleted?: boolean;
  occurredAt!: string;
  incidentDate?: string;
  status?: string;
  notes?: any[];
  relationships?: any[];
  attributes?: any[];
  events: IDHIS2Event[];
  eventEntities?: Record<string, Record<string, DataValue>>;
  programStageEvents?: Record<
    string,
    {
      events: IDHIS2Event[];
      pristine: boolean;
    }
  >;

  constructor(enrollmentDetails: Partial<Enrollment>) {
    super(enrollmentDetails);
    this.enrollmentDate = (this.enrolledAt || '').split('T')[0];
    this.incidentDate = (this.occurredAt || '').split('T')[0];
    this.events = EventUtil.getEvents(enrollmentDetails.events || []);
    const eventsByProgramStage = groupBy(this.events, 'programStage');
    this.programStageEvents = Object.keys(eventsByProgramStage).reduce(
      (eventObject, programStage) => {
        return {
          ...eventObject,
          [programStage]: {
            events: eventsByProgramStage[programStage],
            pristine: true,
          },
        };
      },
      {}
    );

    this.eventEntities = this.events.reduce((eventObject, event) => {
      return { ...eventObject, [event.event]: event.dataValueEntities };
    }, {});
  }

  get isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  setProgramStageData(
    programStage: string,
    dataEntities: Record<string, any>[]
  ) {
    let event: IDHIS2Event | undefined = this.events.find(
      (event) => event.programStage === programStage
    );

    const eventIndex = this.events.indexOf(event as IDHIS2Event);

    if (!event) {
      event = EventUtil.generateEvent({
        program: this.program,
        programStage,
        orgUnit: this.orgUnit,
        enrollment: this.enrollment,
        trackedEntity: this.trackedEntity,
      });
    }

    (dataEntities || []).forEach((dataEntity) => {
      //TODO: Add support to filter by event
      const { dataElement, code, value } = dataEntity;

      (event as DHIS2Event).setDataValue({ dataElement, code, value });
    });

    if (eventIndex !== -1) {
      this.events[eventIndex] = event;
    } else {
      this.events.push(event);
    }
  }

  setDataValue(
    dataElement: string,
    value: string,
    programStage: string,
    eventId?: string
  ) {
    let event = eventId
      ? EventUtil.getEventById(this.events as DHIS2Event[], eventId)
      : EventUtil.getEventByStage(this.events as DHIS2Event[], programStage);

    if (!event) {
      event = EventUtil.generateEvent({
        programStage,
        program: this.program,
        orgUnit: this.orgUnit,
        eventId,
        enrollment: '',
      });

      this.events = [...(this.events || []), event];
    }

    event.setDataValue({ dataElement, value });

    const eventIndex = this.events.indexOf(event);

    this.events = [
      ...this.events.slice(0, eventIndex),
      event,
      ...this.events.slice(eventIndex + 1),
    ] as DHIS2Event[];
  }

  setEvent(event: IDHIS2Event) {
    const availableEvent: IDHIS2Event | undefined = this.events.find(
      (eventItem) => eventItem.event === event.event
    );
    const eventIndex = this.events.indexOf(availableEvent as IDHIS2Event);

    if (eventIndex !== -1) {
      this.events[eventIndex] = event;
    } else {
      this.events.push(event);
    }
  }

  setGeometry(geometry: any) {
    this.geometry = geometry;
  }

  getEventsByProgramStage(programStage: string): IDHIS2Event[] {
    return cloneDeep(
      (this.programStageEvents || {})[programStage]?.events || []
    ).sort((a, b) => {
      const dateA: any = new Date(a.eventDate);
      const dateB: any = new Date(b.eventDate);
      return dateB - dateA;
    });
  }

  toObject(): IEnrollment {
    return {
      enrollment: this.enrollment,
      enrolledAt: this.enrolledAt,
      occurredAt: this.occurredAt,
      status: this.status || 'ACTIVE',
      program: this.program,
      orgUnit: this?.orgUnit,
      trackedEntity: this.trackedEntity,
      trackedEntityType: this.trackedEntityType,
      events: this.events.map((event) => event.toObject() as IDHIS2Event),
      attributes: AttributeUtil.sanitizeAttributes(this.attributes || []),
    };
  }
}
