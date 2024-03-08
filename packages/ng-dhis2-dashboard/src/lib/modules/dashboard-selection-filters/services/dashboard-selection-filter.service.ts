import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { map, of, tap } from 'rxjs';
import { DashboardAdditionalFilter } from '../../../models';

@Injectable()
export class DashboardSelectionFilterService {
  constructor(private http: NgxDhis2HttpClientService) {}

  getFilterSelection(additionalFilter: DashboardAdditionalFilter) {
    switch (additionalFilter.dimension) {
      case 'tea':
        return this.http
          .get(
            `trackedEntityAttributes/${additionalFilter.id}.json?fields=id,name,optionSet[id,name,options[id,name,code]]`
          )
          .pipe(
            map((trackedEntityAttribute) => ({
              ...additionalFilter,
              ...trackedEntityAttribute,
              label: trackedEntityAttribute.name || additionalFilter.label,
            }))
          );

      default:
        return of(null);
    }
  }
}
