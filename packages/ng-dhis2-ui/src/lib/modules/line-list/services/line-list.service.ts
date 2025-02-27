import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LineListService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  /** Fetch metadata for a given program */
  getProgramMetadata(programId: string): Observable<any> {
    return this.httpClient.get(`programs/${programId}.json?fields=*`);
  }

  /** Fetch all tracked entity instances (TEIs) for a given program */
  getTrackedEntityInstances(programId: string): Observable<any> {
    return this.httpClient.get(
      `trackedEntityInstances.json?program=${programId}&fields=trackedEntityInstance,attributes[attribute,value]`
    );
  }

  /** Fetch all events for a given program */
  getEvents(programId: string): Observable<any> {
    return this.httpClient.get(
      `events.json?program=${programId}&fields=event,programStage,dataValues[dataElement,value]`
    );
  }
}
