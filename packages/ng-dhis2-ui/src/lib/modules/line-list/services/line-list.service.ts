import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  ProgramMetadata,
  EventsResponse,
  TrackedEntityInstancesResponse,
  LineListResponse,
} from '../models/line-list.models';
import { buildFilters } from '../utils/filter-builder';
import { AttributeFilter } from '../models/attribute-filter.model';

@Injectable()
export class LineListService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}
  private getProgramMetadata(programId: string): Observable<ProgramMetadata> {
    return this.httpClient.get(
      `programs/${programId}.json?fields=programType,programStages[id,name,programStageDataElements[dataElement[id,name]]],organisationUnits[id,name],*`
    );
  }

  private getTrackedEntityInstances(
    programId: string,
    orgUnit: string,
    page: number,
    pageSize: number,
    filters: AttributeFilter[] = [],
    startDate?: string,
    endDate?: string,
    ouMode?: string,
  ): Observable<TrackedEntityInstancesResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter = startDate && endDate ? `&programStartDate=${startDate}&programEndDate=${endDate}` : '';
    const ouModeIdentifier = ouMode ? `&ouMode=${ouMode}`: ``;
    return this.httpClient.get(
      `trackedEntityInstances.json?program=${programId}&ou=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=trackedEntityInstance,attributes[*,displayInList],enrollments[*]&totalPages=true&${filterParams}${dateFilter}&order=created:desc`
    ).pipe(
      map((response: any) => {
       //TODO: use the api to to order by desc
      // response.trackedEntityInstances.reverse();
        return response;
      })
    );
  }

  private getEvents(
    programId: string,
    orgUnit: string,
    page: number,
    pageSize: number,
    filters: AttributeFilter[] = [],
    startDate?: string,
    endDate?: string,
    ouMode?: string,
  ): Observable<EventsResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter = startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
    const ouModeIdentifier = ouMode ? `&ouMode=${ouMode}`: ``;
    return this.httpClient.get(
      `events.json?program=${programId}&orgUnit=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=*&totalPages=true&${filterParams}${dateFilter}`
    );
  }

  private getEventsByProgramStage(
    programStageId: string,
    orgUnit: string,
    page: number,
    pageSize: number,
    filters: AttributeFilter[] = [],
    startDate?: string,
    endDate?: string,
    ouMode?: string,
  ): Observable<EventsResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter = startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
    const ouModeIdentifier = ouMode ? `&ouMode=${ouMode}`: ``;
    return this.httpClient.get(
      `events.json?programStage=${programStageId}&orgUnit=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=*&totalPages=true&${filterParams}${dateFilter}`
    );
  }

  getLineListData(
    programId: string,
    orgUnit: string = '',
    programStageId?: string,
    page: number = 1,
    pageSize: number = 10,
    filters: AttributeFilter[] = [],
    startDate?: string,
    endDate?: string,
    ouMode?: string,
  ): Observable<LineListResponse> {
    return this.getProgramMetadata(programId).pipe(
      switchMap((programMetadata: ProgramMetadata) => {
        if (programStageId) {
          return this.getEventsByProgramStage(programStageId, orgUnit, page, pageSize, filters, startDate, endDate, ouMode).pipe(
            map((events: EventsResponse) => ({
              metadata: programMetadata,
              data: events,
            }))
          );
        }

        if (programMetadata.programType === 'WITH_REGISTRATION') {
          return this.getTrackedEntityInstances(programId, orgUnit, page, pageSize, filters, startDate, endDate, ouMode).pipe(
            map((teis: TrackedEntityInstancesResponse) => ({
              metadata: programMetadata,
              data: teis,
            }))
          );
        } else {
          return this.getEvents(programId, orgUnit, page, pageSize, filters, startDate, endDate, ouMode).pipe(
            map((events: EventsResponse) => ({
              metadata: programMetadata,
              data: events,
            }))
          );
        }
      })
    );
  }
}


// import { Injectable } from '@angular/core';
// import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
// import { Observable } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';
// import {
//   ProgramMetadata,
//   EventsResponse,
//   TrackedEntityInstancesResponse,
//   LineListResponse,
// } from '../models/line-list.models';

// @Injectable()
// export class LineListService {
//   constructor(private httpClient: NgxDhis2HttpClientService) {}

//   private getProgramMetadata(programId: string): Observable<ProgramMetadata> {
//     return this.httpClient.get(
//       `programs/${programId}.json?fields=programType,programStages[id,name,programStageDataElements[dataElement[id,name]]],organisationUnits[id,name]`
//     );
//   }

//   private getTrackedEntityInstances(programId: string, orgUnit: string): Observable<TrackedEntityInstancesResponse> {
//     return this.httpClient.get(
//       `trackedEntityInstances.json?program=${programId}&ou=${orgUnit}&fields=trackedEntityInstance,attributes[*],enrollments[*]`
//     );
//   }

//   private getEvents(programId: string, orgUnit: string): Observable<EventsResponse> {
//     return this.httpClient.get(
//       `events.json?program=${programId}&orgUnit=${orgUnit}&fields=event,programStage,dataValues[dataElement,value]`
//     );
//   }

//   private getEventsByProgramStage(programStageId: string, orgUnit: string): Observable<EventsResponse> {
//     return this.httpClient.get(
//       `events.json?programStage=${programStageId}&orgUnit=${orgUnit}&fields=event,dataValues[dataElement,value]`
//     );
//   }

//   getLineListData(programId: string, orgUnit: string, programStageId?: string): Observable<LineListResponse> {
//     return this.getProgramMetadata(programId).pipe(
//       switchMap((programMetadata: ProgramMetadata) => {
//         if (programStageId) {
//           return this.getEventsByProgramStage(programStageId, orgUnit).pipe(
//             map((events: EventsResponse) => ({
//               metadata: programMetadata,
//               data: events,
//             }))
//           );
//         }

//         if (programMetadata.programType === 'WITH_REGISTRATION') {
//           return this.getTrackedEntityInstances(programId, orgUnit).pipe(
//             map((teis: TrackedEntityInstancesResponse) => ({
//               metadata: programMetadata,
//               data: teis,
//             }))
//           );
//         } else {
//           // TODO: Make orgUnit optional
//           return this.getEvents(programId, '').pipe(
//             map((events: EventsResponse) => ({
//               metadata: programMetadata,
//               data: events,
//             }))
//           );
//         }
//       })
//     );
//   }
// }

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
//     return this.httpClient.get(
//       `programs/${programId}.json?fields=programType,programStages[id,name,programStageDataElements[dataElement[id,name]]],organisationUnits[id,name]`
//     );
//   }

//   /**
//    * Fetches Tracked Entity Instances (TEIs) for Tracker programs
//    */
//   private getTrackedEntityInstances(
//     programId: string,
//     orgUnit: string
//   ): Observable<any> {
//     return this.httpClient.get(
//       `trackedEntityInstances.json?program=${programId}&ou=${orgUnit}&fields=trackedEntityInstance,attributes[*],enrollments[*]`
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
//   private getEventsByProgramStage(
//     programStageId: string,
//     orgUnit: string
//   ): Observable<any> {
//     return this.httpClient.get(
//       `events.json?programStage=${programStageId}&orgUnit=${orgUnit}&fields=event,dataValues[dataElement,value]`
//     );
//   }

//   /**
//    * Main function to fetch line list data based on conditions
//    */
//   // getLineListData(
//   //   programId: string,
//   //   orgUnit: string,
//   //   programStageId?: string
//   // ): Observable<any> {
//   //   if (programStageId) {
//   //     // If `programStageId` is provided, fetch events for that stage and ignore other rules
//   //     return this.getProgramMetadata(programId).pipe(
//   //       switchMap(() => {
//   //         return this.getEventsByProgramStage(programStageId, orgUnit);
//   //       })
//   //     );
//   //     // return this.getEventsByProgramStage(programStageId, orgUnit);
//   //   }

//   //   // Get program metadata to determine if it's Tracker or Event
//   //   return this.getProgramMetadata(programId).pipe(
//   //     switchMap((program) => {
//   //       if (program.programType === 'WITH_REGISTRATION') {
//   //         // Tracker Program → Show Attributes
//   //         return this.getTrackedEntityInstances(programId, orgUnit);
//   //       } else {
//   //         // Event Program → Show Data Elements
//   //         return this.getEvents(programId, orgUnit);
//   //       }
//   //     })
//   //   );
//   // }
//   getLineListData(programId: string, orgUnit: string, programStageId?: string): Observable<{ metadata: any; data: any }> {
//     return this.getProgramMetadata(programId).pipe(
//       switchMap((programMetadata) => {
//         if (programStageId) {
//           return this.getEventsByProgramStage(programStageId, orgUnit).pipe(
//             map((events) => ({
//               metadata: programMetadata, // Pass metadata to the component
//               data: events,
//             }))
//           );
//         }
  
//         if (programMetadata.programType === "WITH_REGISTRATION") {
//           return this.getTrackedEntityInstances(programId, orgUnit).pipe(
//             map((teis) => ({
//               metadata: programMetadata,
//               data: teis,
//             }))
//           );
//         } else {
//           //TODO:make orgUnit optional
//           return this.getEvents(programId, '').pipe(
//             map((events) => ({
//               metadata: programMetadata,
//               data: events,
//             }))
//           );
//         }
//       })
//     );
//   }  
// }
