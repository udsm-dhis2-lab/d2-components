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
}