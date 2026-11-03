// import { Injectable } from '@angular/core';
// import { D2Window } from '@iapps/d2-web-sdk';
// import { from, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// @Injectable()
// export class LineListService {
//   fetchOrgUnits(orgUnitIds: string[]): Observable<Map<string, string>> {
//     const d2 = (window as unknown as D2Window).d2Web;
//     const idsQuery = `filter=id:in:[${orgUnitIds}]`;
//     return from(
//       d2.httpInstance.get(
//         `organisationUnits.json?fields=id,name&paging=false&${idsQuery}`
//       )
//     ).pipe(
//       map((response) => {
//         const orgUnitsMap = new Map<string, string>();
//         (
//           (response?.data?.['organisationUnits'] as {
//             id: string;
//             name: string;
//           }[]) || []
//         ).forEach((orgUnit: { id: string; name: string }) => {
//           orgUnitsMap.set(orgUnit.id, orgUnit.name);
//         });
//         return orgUnitsMap;
//       })
//     );
//   }
// }


import { Injectable } from '@angular/core';
import { D2Window } from '@iapps/d2-web-sdk';
import { forkJoin, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  OrganisationUnitHierarchy,
  OrganisationUnitLevel,
} from '../models/line-list.models';
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
        ).forEach((orgUnit: { id: string; name: string; }) => {
          orgUnitsMap.set(orgUnit.id, orgUnit.name);
        });
        return orgUnitsMap;
      })
    );
  }

  fetchOrgUnitHierarchy(orgUnitIds: string[]): Observable<{
    hierarchy: Map<string, OrganisationUnitHierarchy>;
    levels: OrganisationUnitLevel[];
  }> {
    const d2 = (window as unknown as D2Window).d2Web;
    const idsQuery = `filter=id:in:[${orgUnitIds}]`;
    return forkJoin({
      orgUnits: from(
        d2.httpInstance.get(
          `organisationUnits.json?fields=id,name,level,ancestors[id,name,level]&paging=false&${idsQuery}`
        )
      ),
      levels: from(
        d2.httpInstance.get(
          'organisationUnitLevels.json?fields=level,name&paging=false'
        )
      ),
    }).pipe(
      map(({ orgUnits, levels }) => ({
        hierarchy: new Map(
          ((orgUnits?.data?.['organisationUnits'] ?? []) as OrganisationUnitHierarchy[])
            .map((orgUnit) => [orgUnit.id, orgUnit])
        ),
        levels: ((levels?.data?.['organisationUnitLevels'] ?? []) as OrganisationUnitLevel[])
          .slice()
          .sort((a, b) => a.level - b.level),
      }))
    );
  }
}
