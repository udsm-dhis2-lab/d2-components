import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
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