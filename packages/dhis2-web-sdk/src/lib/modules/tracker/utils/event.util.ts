import { generateUid } from '@iapps/d2-web-sdk';
import { DHIS2Event, IDHIS2Event } from '../models';

export class EventUtil {
  static getEvents(eventList: Record<string, any>): DHIS2Event[] {
    return eventList['map'](
      (event: Partial<DHIS2Event>) => new DHIS2Event(event)
    );
  }

  static sortEvents(
    eventList: DHIS2Event[],
    sortOrder: 'DESC' | 'ASC' = 'DESC'
  ): DHIS2Event[] {
    return (eventList || []).sort((a, b) => {
      const dateA: any = new Date(a.dueDate as any);
      const dateB: any = new Date(b.dueDate as any);

      switch (sortOrder) {
        case 'DESC':
          return dateB - dateA;
        case 'ASC':
        default:
          return dateA - dateB;
      }
    });
  }

  static generateEvent(params: {
    program: string;
    programStage: string;
    orgUnit: string;
    eventId?: string;
    enrollment?: string;
    trackedEntity?: string;
    eventDate?: string;
  }): DHIS2Event {
    return new DHIS2Event({
      programStage: params?.programStage,
      enrollment: params?.enrollment,
      trackedEntity: params?.trackedEntity,
      event: params?.eventId || generateUid(),
      orgUnit: params?.orgUnit,
      program: params?.program,
      status: 'ACTIVE',
      eventDate: params?.eventDate || new Date().toISOString(),
      dataValues: [],
      dataValueEntities: {},
    }) as any;
  }

  static getEventByStage(
    events: DHIS2Event[],
    programStage: string
  ): DHIS2Event | undefined {
    return (events || []).find((event) => event.programStage === programStage);
  }

  static getEventById(
    events: DHIS2Event[],
    eventId: string
  ): DHIS2Event | undefined {
    return (events || []).find((event) => event.event === eventId);
  }
}
