import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  ProgramMetadata,
  EventsResponse,
  TrackedEntityInstancesResponse,
  LineListResponse,
  TrackedEntityResponse,
} from '../models/line-list.models';
import {
  buildFilters,
  buildFiltersFromEvents,
  getFilteredTrackedEntites,
} from '../utils/filter-builder';
import { AttributeFilter } from '../models/attribute-filter.model';
import { FilterConfig } from '../models/filter-config.model';
import { Data } from '@angular/router';
import { DataElementFilter } from '../models/data-element-filter.model';

@Injectable()
export class LineListService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  private getTrackedEntityInstances(
    programId: string,
    orgUnit: string,
    page: number,
    pageSize: number,
    filters: AttributeFilter[] = [],
    startDate?: string,
    endDate?: string,
    ouMode?: string,
    filterRootOrgUnit?: boolean,
    useOuModeWithOlderDHIS2Instance?: boolean,
    filtersFromEvents: FilterConfig[] = [],
    dataElementFilter?: DataElementFilter
  ): Observable<TrackedEntityResponse> {
    const filterParams = buildFilters(filters);
    const filterParamsFromEvents = buildFiltersFromEvents(filtersFromEvents);
    const dateFilter = [
      startDate ? `enrollmentEnrolledAfter=${startDate}` : '',
      endDate ? `enrollmentEnrolledBefore=${endDate}` : '',
    ]
      .filter(Boolean)
      .join('&');
    const ouModeIdentifier =
      ouMode && useOuModeWithOlderDHIS2Instance
        ? `&ouMode=${ouMode}`
        : `&orgUnitMode=${ouMode}`;

    return this.httpClient
      .get(
        `tracker/trackedEntities.json?program=${programId}&orgUnit=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=trackedEntity,orgUnit,attributes[*],enrollments[*]&totalPages=true&${filterParams}${dateFilter}&order=createdAt:desc`
      )
      .pipe(
        switchMap((response: any) => {
          if (filterRootOrgUnit) {
            response.trackedEntities = response.trackedEntities.filter(
              (tei: any) => tei.orgUnit !== orgUnit
            );
          }

          // **Step 1:** Extract unique orgUnits from enrollments
          const uniqueOrgUnitIds = new Set<string>();

          if (response && response.trackedEntities) {
            response.trackedEntities.forEach((tei: any) => {
              tei.enrollments?.forEach((enrollment: any) => {
                if (enrollment.program === programId) {
                  uniqueOrgUnitIds.add(enrollment.orgUnit);
                }
              });
            });
          } else {
            if (response && response.instances) {
              response?.instances?.forEach((tei: any) => {
                tei.enrollments?.forEach((enrollment: any) => {
                  if (enrollment.program === programId) {
                    uniqueOrgUnitIds.add(enrollment?.orgUnit);
                  }
                });
              });
            }
          }

          // If no unique orgUnits found, return immediately
          if (uniqueOrgUnitIds.size === 0) {
            return of({ ...response, orgUnitsMap: new Map<string, string>() });
          }

          // **Step 2:** Fetch orgUnit names in a single request
          return this.fetchOrgUnits(Array.from(uniqueOrgUnitIds)).pipe(
            map((orgUnitsMap: Map<string, string>) => ({
              ...response,
              orgUnitsMap, // Attach orgUnitId → orgUnitName map
            }))
          );
        })
      );
  }

  /**
   * Fetch orgUnit names for given orgUnit IDs
   */
   fetchOrgUnits(orgUnitIds: string[]): Observable<Map<string, string>> {
    const idsQuery = `filter=id:in:[${orgUnitIds}]`;
    return this.httpClient
      .get(`organisationUnits.json?fields=id,name&paging=false&${idsQuery}`)
      .pipe(
        map((response) => {
          const orgUnitsMap = new Map<string, string>();
          response.organisationUnits.forEach(
            (orgUnit: { id: string; name: string }) => {
              orgUnitsMap.set(orgUnit.id, orgUnit.name);
            }
          );
          return orgUnitsMap;
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
    useOuModeWithOlderDHIS2Instance?: boolean
  ): Observable<EventsResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter =
      startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
    const ouModeIdentifier =
      ouMode && useOuModeWithOlderDHIS2Instance
        ? `&ouMode=${ouMode}`
        : `&ouMode=${ouMode}`;
    // const ouModeIdentifier = ouMode ? `&ouMode=${ouMode}`: ``;
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
    ouMode?: string
  ): Observable<EventsResponse> {
    const filterParams = buildFilters(filters);
    const dateFilter =
      startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : '';
    const ouModeIdentifier = ouMode ? `&ouMode=${ouMode}` : ``;
    return this.httpClient.get(
      `events.json?programStage=${programStageId}&orgUnit=${orgUnit}${ouModeIdentifier}&page=${page}&pageSize=${pageSize}&fields=*&totalPages=true&${filterParams}${dateFilter}`
    );
  }

  getLineListData(
    programId: string,
    orgUnit = '',
    programStageId?: string,
    page = 1,
    pageSize = 10,
    filters: AttributeFilter[] = [],
    startDate?: string,
    endDate?: string,
    ouMode?: string,
    filterRootOrgUnit?: boolean,
    useOuModeWithOlderDHIS2Instance?: boolean,
    filtersFromEvents: FilterConfig[] = [],
    dataElementFilter?: DataElementFilter
  ): Observable<LineListResponse> {
    if (programStageId) {
      return this.getEventsByProgramStage(
        programStageId,
        orgUnit,
        page,
        pageSize,
        filters,
        startDate,
        endDate,
        ouMode
      ).pipe(
        map((events: EventsResponse) => ({
          data: events,
        }))
      );
    }

    if (programId) {
      return this.getTrackedEntityInstances(
        programId,
        orgUnit,
        page,
        pageSize,
        filters,
        startDate,
        endDate,
        ouMode,
        filterRootOrgUnit,
        useOuModeWithOlderDHIS2Instance,
        filtersFromEvents,
        dataElementFilter
      ).pipe(
        map((teis: TrackedEntityResponse) => ({
          data: teis,
          orgUnits: teis.orgUnitsMap,
        }))
      );
    }

    return this.getEvents(
      programId,
      orgUnit,
      page,
      pageSize,
      filters,
      startDate,
      endDate,
      ouMode,
      useOuModeWithOlderDHIS2Instance
    ).pipe(
      map((events: EventsResponse) => ({
        data: events,
      }))
    );
  }
}
