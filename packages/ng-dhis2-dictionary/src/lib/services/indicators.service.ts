import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, mergeMap, tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';

@Injectable({
  providedIn: 'root',
})
export class IndicatorsService {
  indicators: any[] = [];
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  // load indicators
  loadIndicatorsByPage(page: any) {
    let url =
      'indicators.json?fields=id,name,numerator,denominator,indicatorType[name],';
    url +=
      'denominatorDescription,numeratorDescription,user[name],lastUpdated,indicatorGroups[id]&pageSize=400&page=' +
      page;
    return this.httpClient.get(url);
  }

  loadIndicatorsById(id: any) {
    let url =
      'indicators/' +
      id +
      '.json?fields=id,name,numerator,denominator,indicatorType[name],';
    url +=
      'denominatorDescription,numeratorDescription,user[name],lastUpdated,indicatorGroups[id]';
    return this.httpClient.get(url);
  }

  _loadAllIndicators(pagerDefinitions: any): Observable<any> {
    // format pageSize as per number of indicators
    let pageSize = 20;
    let pageCount = 1;
    if (pagerDefinitions.total < 200) {
      pageSize = 20;
      pageCount = Math.ceil(pagerDefinitions.total / pageSize);
    } else if (pagerDefinitions.total <= 3000 && pagerDefinitions.total > 200) {
      pageSize = 100;
      pageCount = Math.ceil(pagerDefinitions.total / pageSize);
    } else if (pagerDefinitions.total > 3000) {
      pageSize = 400;
      pageCount = Math.ceil(pagerDefinitions.total / pageSize);
      // pageSize = pagerDefinitions.pageSize;
      // pageCount = pagerDefinitions.pageCount;
    }
    return from(
      _.map(
        _.range(1, pageCount + 1),
        (pageNumber) =>
          'indicators.json?fields=:all,lastUpdatedBy[id,name],displayName,id,name,' +
          'numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,' +
          'indicatorType[name],user[name],attributeValues[value,attribute[name]],indicatorGroups[id,name,indicators~size],' +
          'legendSets[id,name,symbolizer,legends~size],dataSets[id,name]&pageSize=' +
          pageSize +
          '&page=' +
          pageNumber
      )
    ).pipe(
      mergeMap(
        (url: string) =>
          this.httpClient.get(url).pipe(map((indicators: any) => indicators)),
        1
      )
    );
  }

  _indicatorProperties(indicatorsObj: any): Observable<any> {
    this.indicators = [...this.indicators, ...indicatorsObj];

    return from(
      _.map(
        this.indicators,
        (indicator) =>
          'indicators/' +
          indicator.id +
          '.json?fields=:all,lastUpdatedBy[id,name],displayName,id,name,' +
          'numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,' +
          'indicatorType[name],user[name],indicatorGroups[name,indicators~size]'
      )
    ).pipe(
      mergeMap(
        (url: string) =>
          this.httpClient.get(url).pipe(map((indicators: any) => indicators)),
        1
      )
    );
  }
}
