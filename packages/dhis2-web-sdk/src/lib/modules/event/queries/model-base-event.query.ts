import { D2HttpClient } from '../../../shared';
import { DHIS2Event, IDHIS2Event } from '../models';
import { BaseEventQuery } from './base-event.query';

export class ModelBaseEventQuery<
  T extends DHIS2Event
> extends BaseEventQuery<T> {
  constructor(httpClient: D2HttpClient, identifiable: IDHIS2Event) {
    super(httpClient);
    this.identifiable = identifiable;
    this.instance = new (identifiable as any)();
    this.setProgram(this.instance.program);
  }
}
