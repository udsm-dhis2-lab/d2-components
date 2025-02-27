// import { Injectable } from '@angular/core';
// import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
// import { Observable } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';

// @Injectable()
// export class LineListService {
//   constructor(private httpClient: NgxDhis2HttpClientService) {}

//   /**
//    * Fetches the program metadata
//    */
//   private getProgramMetadata(programId: string): Observable<any> {
//     return this.httpClient.get(`programs/${programId}.json?fields=programType,programStages[id,name]`);
//   }

//   /**
//    * Fetches Tracked Entity Instances (TEIs) for Tracker programs
//    */
//   private getTrackedEntityInstances(programId: string, orgUnit: string): Observable<any> {
//     return this.httpClient.get(
//       `trackedEntityInstances.json?program=${programId}&ou=${orgUnit}&fields=trackedEntityInstance,attributes[attribute,value]`
//     );
//   }

//   /**
//    * Fetches Events for Event programs
//    */
//   private getEvents(programId: string, orgUnit: string): Observable<any> {
//     return this.httpClient.get(
//       `events.json?program=${programId}&orgUnit=${orgUnit}&fields=event,programStage,dataValues[dataElement,value]`
//     );
//   }

//   /**
//    * Fetches Events for a specific Program Stage
//    */
//   private getEventsByProgramStage(programStageId: string, orgUnit: string): Observable<any> {
//     return this.httpClient.get(
//       `events.json?programStage=${programStageId}&orgUnit=${orgUnit}&fields=event,dataValues[dataElement,value]`
//     );
//   }

//   /**
//    * Main function to fetch line list data based on conditions
//    */
//   getLineListData(programId: string, orgUnit: string, programStageId?: string): Observable<any> {
//     if (programStageId) {
//       // If `programStageId` is provided, fetch events for that stage and ignore other rules
//       return this.getEventsByProgramStage(programStageId, orgUnit);
//     }

//     //  Get program metadata to determine if it's Tracker or Event
//     return this.getProgramMetadata(programId).pipe(
//       switchMap((program) => {
//         if (program.programType === 'WITH_REGISTRATION') {
//           //  Tracker Program → Show Attributes
//           return this.getTrackedEntityInstances(programId, orgUnit);
//         } else {
//           // Event Program → Show Data Elements
//           return this.getEvents(programId, orgUnit);
//         }
//       })
//     );
//   }
// }


import { Injectable } from "@angular/core";
import { NgxDhis2HttpClientService } from "@iapps/ngx-dhis2-http-client";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class LineListService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  /**
   * Fetches the program metadata
   */
  private getProgramMetadata(programId: string): Observable<any> {
    return this.httpClient.get(
      `programs/${programId}.json?fields=programType,programStages[id,name]`
    );
  }

  /**
   * Fetches Tracked Entity Instances (TEIs) for Tracker programs
   */
  private getTrackedEntityInstances(
    programId: string,
    orgUnit: string
  ): Observable<any> {
    return this.httpClient.get(
      `trackedEntityInstances.json?program=${programId}&ou=${orgUnit}&fields=trackedEntityInstance,attributes[*],enrollments[*]`
    );
  }

  /**
   * Fetches Events for Event programs
   */
  private getEvents(programId: string, orgUnit: string): Observable<any> {
    return this.httpClient.get(
      `events.json?program=${programId}&orgUnit=${orgUnit}&fields=event,programStage,dataValues[dataElement,value]`
    );
  }

  /**
   * Fetches Events for a specific Program Stage
   */
  private getEventsByProgramStage(
    programStageId: string,
    orgUnit: string
  ): Observable<any> {
    return this.httpClient.get(
      `events.json?programStage=${programStageId}&orgUnit=${orgUnit}&fields=event,dataValues[dataElement,value]`
    );
  }

  /**
   * Main function to fetch line list data based on conditions
   */
  getLineListData(
    programId: string,
    orgUnit: string,
    programStageId?: string
  ): Observable<any> {
    if (programStageId) {
      // If `programStageId` is provided, fetch events for that stage and ignore other rules
      return this.getEventsByProgramStage(programStageId, orgUnit);
    }

    // Get program metadata to determine if it's Tracker or Event
    return this.getProgramMetadata(programId).pipe(
      switchMap((program) => {
        if (program.programType === "WITH_REGISTRATION") {
          // Tracker Program → Show Attributes
          return this.getTrackedEntityInstances(programId, orgUnit);
        } else {
          // Event Program → Show Data Elements
          return this.getEvents(programId, orgUnit);
        }
      })
    );
  }
}
