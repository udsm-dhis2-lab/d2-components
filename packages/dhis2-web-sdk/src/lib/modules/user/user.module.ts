// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { UserQuery } from './queries';
import { D2HttpClient } from '../../shared';
import { CurrentUser } from './models';

export class UserModule {
  constructor(private httpClient: D2HttpClient) {}

  async currentUser(): Promise<CurrentUser | null> {
    const [userResponse, authorityResponse] = await Promise.all([
      this.httpClient.get(
        'me?fields=id,name,displayName,created,' +
          'lastUpdated,email,dataViewOrganisationUnits[id,code,path,name,level],' +
          'organisationUnits[id,code,path,name,level],userCredentials[username],userGroups[id,name]'
      ),
      this.httpClient.get(`me/authorization`),
    ]);

    return new CurrentUser({
      ...(userResponse.data || {}),
      authorities: authorityResponse.data || [],
    });

    // .pipe(
    //   map((currentUserResults: any[]) => {
    //     return {
    //       ...currentUserResults[0],
    //       authorities: currentUserResults[1],
    //     };
    //   })
    // );
  }

  get user(): UserQuery {
    return new UserQuery(this.httpClient);
  }
}
