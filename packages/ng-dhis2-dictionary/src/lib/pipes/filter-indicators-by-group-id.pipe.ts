import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'filterIndicatorsByGroupId',
    pure: false,
    standalone: false
})
export class FilterIndicatorsByGroupIdPipe implements PipeTransform {
  transform(indicators: any, groups: any): any {
    if (groups.length > 0) {
      let indicatorsArray: any[] = [];
      _.map(indicators, (indicator: any) => {
        _.map(groups, (groupSelected: any) => {
          _.map(indicator.indicatorGroups, (group) => {
            if (groupSelected['id'] == group.id) {
              indicatorsArray.push(indicator);
            }
          });
        });
      });
      return indicatorsArray;
    } else {
      return indicators;
    }
  }
}
