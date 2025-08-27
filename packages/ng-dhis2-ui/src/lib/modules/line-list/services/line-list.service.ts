import { Injectable } from '@angular/core';
import { D2Window } from '@iapps/d2-web-sdk';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class LineListService {
  fetchOrgUnits(orgUnitIds: string[]): Observable<Map<string, string>> {
    const d2 = (window as unknown as D2Window).d2Web;
    const idsQuery = `filter=id:in:[${orgUnitIds}]`;
    return from(
      d2.httpInstance.get(
        `organisationUnits.json?fields=id,name&paging=false&${idsQuery}`
      )
    ).pipe(
      map((response) => {
        const orgUnitsMap = new Map<string, string>();
        (
          (response?.data?.['organisationUnits'] as {
            id: string;
            name: string;
          }[]) || []
        ).forEach((orgUnit: { id: string; name: string }) => {
          orgUnitsMap.set(orgUnit.id, orgUnit.name);
        });
        return orgUnitsMap;
      })
    );
  }
}
