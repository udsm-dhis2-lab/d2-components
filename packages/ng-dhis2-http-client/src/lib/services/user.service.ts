import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor() {}

  getCurrentUser(httpClient: HttpClient, rootUrl: string): Observable<User> {
    return forkJoin(
      httpClient.get(
        rootUrl +
          'api/me?fields=id,name,displayName,created,' +
          'lastUpdated,email,dataViewOrganisationUnits[id,name,level],' +
          'organisationUnits[id,name,level],userCredentials[username],userGroups[id,name]'
      ),
      httpClient.get(`${rootUrl}api/me/authorization`)
    ).pipe(
      map((currentUserResults: any[]) => {
        return {
          ...currentUserResults[0],
          authorities: currentUserResults[1],
        };
      })
    );
  }
}
