import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor() {}

  getCurrentUser(httpClient: HttpClient, rootUrl: string): Observable<User> {
    return zip(
      httpClient.get(
        encodeURI(
          rootUrl +
            'api/me?fields=id,name,displayName,created,' +
            'lastUpdated,email,dataViewOrganisationUnits[id,name,level],' +
            'organisationUnits[id,name,level],userCredentials[username],userGroups[id,name]'
        )
      ),
      httpClient
        .get(encodeURI(`${rootUrl}api/me/authorization`))
        .pipe(catchError(() => of([])))
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
