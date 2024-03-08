import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { flatten } from 'lodash';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { getDataStoreUrlParams } from '../helpers/get-data-store-url-params.helper';
import { ErrorMessage } from '../models/error-message.model';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private _dataStoreApiPrefix: string;
  constructor(private httpClient: HttpClient) {
    this._dataStoreApiPrefix = 'dataStore/';
  }

  findNamespaceKeys(namespace: string, rootUrl: string): Observable<string[]> {
    return this.httpClient
      .get<string[]>(`${rootUrl}api/${this._dataStoreApiPrefix}${namespace}`)
      .pipe(
        catchError((error: ErrorMessage) => {
          if (error.status === 404) {
            return of([]);
          }

          return throwError(error);
        })
      );
  }

  findByKeys(
    namespace: string,
    keys: string[],
    rootUrl: string
  ): Observable<any[]> {
    if (keys?.length === 0) {
      return of([]);
    }
    return zip(
      ...(keys || []).map((key: string) =>
        this.findOne(namespace, key, rootUrl)
      )
    ).pipe(
      map((results: any[]) =>
        flatten((results || []).filter((resultItem) => resultItem))
      )
    );
  }

  findAll(
    namespace: string,
    rootUrl: string
  ): Observable<{ [namespace: string]: any[] }> {
    return this.findNamespaceKeys(namespace, rootUrl).pipe(
      switchMap((keys: string[]) =>
        this.findByKeys(namespace, keys, rootUrl).pipe(
          map((keyValues) => ({
            [namespace]: keyValues,
          }))
        )
      )
    );
  }

  findOne(namespace: string, key: string, rootUrl: string): Observable<any> {
    return this.httpClient
      .get(`${rootUrl}api/${this._dataStoreApiPrefix + namespace}/${key}`)
      .pipe(
        catchError((error: ErrorMessage) => {
          if (error.status === 404) {
            return of(null);
          }

          return throwError(error);
        })
      );
  }

  get(dataStoreUrl: string, rootUrl: string): Observable<any> {
    const { key, namespace } = getDataStoreUrlParams(dataStoreUrl) || {
      key: undefined,
      namespace: undefined,
    };

    if (key) {
      return this.findOne(namespace, key, rootUrl);
    }

    return this.findAll(namespace, rootUrl);
  }

  saveByTrial(namespace: string, rootUrl: string, data: any): Observable<any> {
    return this.update(namespace, rootUrl, data).pipe(
      catchError(() => this.create(rootUrl, namespace, data))
    );
  }

  create(rootUrl: string, namespace: string, data: any): Observable<any> {
    return this.httpClient
      .post(
        `${rootUrl}api/${this._dataStoreApiPrefix + namespace}/${data.id}`,
        data
      )
      .pipe(map(() => data));
  }

  update(namespace: string, rootUrl: string, data: any): Observable<any> {
    return this.httpClient
      .put(
        `${rootUrl}api/${this._dataStoreApiPrefix + namespace}/${data.id}`,
        data
      )
      .pipe(map(() => data));
  }
}
