import { Injectable } from '@angular/core';
import { D2Window } from '@iapps/d2-web-sdk';
import { from, map, of } from 'rxjs';
import { DashboardAdditionalFilter } from '../../../models';

@Injectable()
export class DashboardSelectionFilterService {
  getFilterSelection(additionalFilter: DashboardAdditionalFilter): any {
    const d2 = (window as unknown as D2Window).d2Web;
    switch (additionalFilter.dimension) {
      case 'tea':
        return from(
          d2.httpInstance.get(
            `trackedEntityAttributes/${additionalFilter.id}.json?fields=id,name,optionSet[id,name,options[id,name,code]]`
          )
        ).pipe(
          map(({ data: trackedEntityAttribute }) => ({
            ...additionalFilter,
            ...(trackedEntityAttribute || {}),
            label: ((trackedEntityAttribute?.['name'] as string) ||
              additionalFilter.label) as string,
          }))
        );

      default:
        return of(null);
    }
  }
}
