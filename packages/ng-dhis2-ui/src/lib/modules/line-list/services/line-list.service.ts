import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  ProgramMetadata,
  EventsResponse,
  TrackedEntityInstancesResponse,
  LineListResponse,
  EnrollmentsResponse,
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

  // programStartDate programEndDate	
  // enrolledAfter    enrolledBefore

  private getEnrollments(
    programId: string,
    orgUnit: string,
    page: number,
    pageSize: number,
    filters: AttributeFilter[] = [],
    startDate?: string,  
    endDate?: string,
    ouMode?: string,
    filterRootOrgUnit?: boolean
  ): Observable<EnrollmentsResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter = startDate && endDate ? `&enrolledAfter=${startDate}&enrolledBefore=${endDate}` : '';
    const ouModeIdentifier = ouMode ? `&orgUnitMode=${ouMode}`: ``;
    return this.httpClient.get(
      `tracker/enrollments.json?program=${programId}&orgUnit=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=orgUnit,attributes[*]&totalPages=true&${filterParams}${dateFilter}&order=createdAt:desc`
    ).pipe(
      map((response: any) => {
        if (filterRootOrgUnit) {
          response.enrollments = response.enrollments.filter(
            (enrollment: any) => enrollment.orgUnit !== orgUnit // Exclude enrollments with the root orgUnit
          );
        }
        return response;
      })
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
    filterRootOrgUnit?: boolean
  ): Observable<TrackedEntityInstancesResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter = startDate && endDate ? `&programStartDate=${startDate}&programEndDate=${endDate}` : '';
    const ouModeIdentifier = ouMode ? `&ouMode=${ouMode}`: ``;
    return this.httpClient.get(
      `trackedEntityInstances.json?program=${programId}&ou=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=trackedEntityInstance,orgUnit,attributes[*,displayInList],enrollments[*]&totalPages=true&${filterParams}${dateFilter}&order=created:desc`
    ).pipe(
      map((response: any) => {
        if (filterRootOrgUnit) {
          response.trackedEntityInstances = response.trackedEntityInstances.filter(
            (tei: any) => tei.orgUnit !== orgUnit // Exclude TEIs with the root orgUnit
          );
        }
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
    filterRootOrgUnit?: boolean
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
          return this.getEnrollments(programId, orgUnit, page, pageSize, filters, startDate, endDate, ouMode, filterRootOrgUnit).pipe(
            map((enrollments: EnrollmentsResponse) => ({
              metadata: programMetadata,
              data: enrollments,
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


