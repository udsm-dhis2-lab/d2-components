import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, zip } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { isArray } from 'lodash';
import {
  DEFAULT_ROOT_URL,
  HTTP_HEADER_OPTIONS,
} from '../constants/http.constant';
import { deduceUrlContent } from '../helpers/deduce-url-content.helper';
import { getRootUrl } from '../helpers/get-root-url.helper';
import { getSanitizedHttpConfig } from '../helpers/get-sanitized-http-config.helper';
import { getSystemVersion } from '../helpers/get-system-version.helper';
import { isDataStoreRequest } from '../helpers/is-datastore-request.helper';
import { ErrorMessage } from '../models/error-message.model';
import { HttpConfig } from '../models/http-config.model';
import { IndexDBParams } from '../models/index-db-params.model';
import { Manifest } from '../models/manifest.model';
import { SystemInfo } from '../models/system-info.model';
import { User } from '../models/user.model';
import { DataStoreService } from './data-store.service';
import { IndexDbService } from './index-db.service';
import { ManifestService } from './manifest.service';
import { SystemInfoService } from './system-info.service';
import { UserService } from './user.service';

interface Instance {
  manifest: Manifest | null;
  rootUrl: string;
  version: number;
  systemInfo?: SystemInfo;
  currentUser?: User;
}

@Injectable({ providedIn: 'root' })
export class NgxDhis2HttpClientService {
  private _error: ErrorMessage | undefined;
  private _loaded$: BehaviorSubject<boolean>;
  private loaded$: Observable<boolean>;
  private _instance: Instance;
  private _initiated: boolean = false;
  constructor(
    private httpClient: HttpClient,
    private manifestService: ManifestService,
    private systemInfoService: SystemInfoService,
    private indexDbService: IndexDbService,
    private userService: UserService,
    private dataStoreService: DataStoreService
  ) {
    this._instance = {
      manifest: null,
      rootUrl: DEFAULT_ROOT_URL,
      version: 0,
    };
    this._loaded$ = new BehaviorSubject<boolean>(false);
    this.loaded$ = this._loaded$.asObservable();

    if (!this._initiated) {
      this._initiated = true;
      this.init();
    }
  }

  init() {
    this.manifestService
      .getManifest(this.httpClient)
      .pipe(
        switchMap((manifest: Manifest | null) => {
          const rootUrl = getRootUrl(manifest as Manifest);
          return zip(
            this.systemInfoService
              .get(this.httpClient, rootUrl)
              .pipe(catchError(this._handleError)),
            this.userService
              .getCurrentUser(this.httpClient, rootUrl)
              .pipe(catchError(this._handleError))
          ).pipe(
            map((res: any[]) => {
              return {
                rootUrl,
                manifest,
                systemInfo: res[0],
                currentUser: res[1],
              };
            })
          );
        })
      )
      .subscribe(
        (res) => {
          this._instance = {
            ...this._instance,
            ...res,
            version: getSystemVersion(res.systemInfo),
          };
          this._loaded$.next(true);
        },
        (error: ErrorMessage) => {
          this._error = error;
        }
      );
  }

  get(url: string, httpConfig?: HttpConfig): Observable<any> {
    const newHttpConfig = getSanitizedHttpConfig(httpConfig);

    const httpOptions = this._getHttpOptions(newHttpConfig.httpHeaders);

    if (newHttpConfig.isExternalLink) {
      return httpOptions
        ? this.httpClient.get(url, httpOptions)
        : this.httpClient.get(url);
    }

    if (
      newHttpConfig.allowDataStoreRequestStandardization &&
      isDataStoreRequest(url)
    ) {
      return this.dataStoreService.get(url, this._instance.rootUrl);
    }

    return this._get(url, newHttpConfig, httpOptions);
  }

  post(url: string, data: any, httpConfig?: HttpConfig) {
    const newHttpConfig = getSanitizedHttpConfig(httpConfig);

    const httpOptions = this._getHttpOptions(newHttpConfig.httpHeaders);

    return this._getRootUrl(newHttpConfig).pipe(
      mergeMap((rootUrl) =>
        (httpOptions
          ? this.httpClient.post(rootUrl + url, data, httpOptions)
          : this.httpClient.post(rootUrl + url, data)
        ).pipe(catchError(this._handleError))
      ),
      catchError(this._handleError)
    );
  }

  put(url: string, data: any, httpConfig?: HttpConfig) {
    const newHttpConfig = getSanitizedHttpConfig(httpConfig);

    const httpOptions = this._getHttpOptions(newHttpConfig.httpHeaders);
    return this._getRootUrl(newHttpConfig).pipe(
      mergeMap((rootUrl) =>
        (httpOptions
          ? this.httpClient.put(rootUrl + url, data, httpOptions)
          : this.httpClient.put(rootUrl + url, data)
        ).pipe(catchError(this._handleError))
      ),
      catchError(this._handleError)
    );
  }

  patch(url: string, data: any, httpConfig?: HttpConfig) {
    const newHttpConfig = getSanitizedHttpConfig(httpConfig);

    const httpOptions = this._getHttpOptions(newHttpConfig.httpHeaders);
    return this._getRootUrl(newHttpConfig).pipe(
      mergeMap((rootUrl) =>
        (httpOptions
          ? this.httpClient.patch(rootUrl + url, data, httpOptions)
          : this.httpClient.patch(rootUrl + url, data)
        ).pipe(catchError(this._handleError))
      ),
      catchError(this._handleError)
    );
  }

  delete(url: string, httpConfig?: HttpConfig) {
    const newHttpConfig = getSanitizedHttpConfig(httpConfig);

    const httpOptions = this._getHttpOptions(newHttpConfig.httpHeaders);
    return this._getRootUrl(newHttpConfig).pipe(
      mergeMap((rootUrl) =>
        (httpOptions
          ? this.httpClient.delete(rootUrl + url, httpOptions)
          : this.httpClient.delete(rootUrl + url)
        ).pipe(catchError(this._handleError))
      ),
      catchError(this._handleError)
    );
  }

  me(): Observable<User> {
    return this._getInstance().pipe(
      map((instance: Instance) => instance.currentUser!)
    );
  }

  systemInfo(): Observable<SystemInfo> {
    return this._getInstance().pipe(
      map((instance: Instance) => instance.systemInfo!)
    );
  }

  rootUrl(): Observable<string> {
    return this._getInstance().pipe(
      map((instance: Instance) => instance.rootUrl)
    );
  }

  manifest(): Observable<Manifest> {
    return this._getInstance().pipe(
      map((instance: Instance) => instance.manifest!)
    );
  }

  // private methods

  private _getInstance(): Observable<Instance> {
    if (this._error) {
      return throwError(this._error);
    }

    return this.loaded$.pipe(
      filter((loaded) => loaded),
      map(() => this._instance)
    );
  }

  private _getFromIndexDb(
    url: string,
    httpConfig: HttpConfig,
    httpOptions: any
  ) {
    const urlContent = deduceUrlContent(url);
    const schemaName =
      urlContent && urlContent.schema ? urlContent.schema.name : undefined;

    const id =
      urlContent && urlContent.schema ? urlContent.schema.id : undefined;

    const params: IndexDBParams = urlContent ? urlContent.params || {} : {};

    if (!schemaName) {
      console.warn('index db operations failed, Error: Schema is not supplied');
      return this._getFromServer(url, httpConfig, httpOptions);
    }

    return (
      id
        ? this.indexDbService.findById(schemaName, id)
        : this.indexDbService.findAll(schemaName, params)
    ).pipe(
      mergeMap((indexDbResponse: any) => {
        if (
          !indexDbResponse ||
          (indexDbResponse[schemaName] &&
            indexDbResponse[schemaName].length === 0)
        ) {
          return !httpConfig.fetchOnlineIfNotExist
            ? of(id ? null : { [schemaName]: [] })
            : this._getFromServer(url, httpConfig, httpOptions).pipe(
                mergeMap((serverResponse: any) => {
                  if (!serverResponse) {
                    return of(null);
                  }

                  const isDataStoreResource = url.includes('dataStore');

                  const responseData = isDataStoreResource
                    ? isArray(serverResponse)
                      ? serverResponse
                      : serverResponse['entries']
                    : serverResponse[schemaName];

                  return id
                    ? this.indexDbService.saveOne(schemaName, serverResponse)
                    : this.indexDbService
                        .saveBulk(schemaName, responseData)
                        .pipe(
                          map(() =>
                            isDataStoreResource
                              ? { [schemaName]: responseData }
                              : serverResponse
                          )
                        );
                })
              );
        }

        return of(indexDbResponse);
      })
    );
  }

  private _get(url: string, httpConfig: HttpConfig, httpOptions: any) {
    if (httpConfig.useIndexDb) {
      return this._getFromIndexDb(url, httpConfig, httpOptions);
    }

    return this._getFromServer(url, httpConfig, httpOptions);
  }

  private _getFromServer(
    url: string,
    httpConfig: HttpConfig,
    httpOptions: any
  ) {
    return this._getRootUrl(httpConfig).pipe(
      mergeMap((rootUrl) =>
        (httpOptions
          ? this.httpClient.get(rootUrl + url, httpOptions)
          : this.httpClient.get(rootUrl + url)
        ).pipe(catchError(this._handleError))
      ),
      catchError(this._handleError)
    );
  }

  private _getRootUrl(httpConfig: HttpConfig) {
    return this._getInstance().pipe(
      mergeMap((instance: Instance) => {
        const rootUrl = instance.rootUrl;
        if (httpConfig.useRootUrl) {
          return of(rootUrl);
        }

        return this._getApiRootUrl(
          rootUrl,
          httpConfig.includeVersionNumber,
          httpConfig.preferPreviousApiVersion
        );
      })
    );
  }
  private _handleError(err: HttpErrorResponse) {
    let error: ErrorMessage;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      error = {
        message: err.error.toString(),
        status: err.status,
        statusText: err.statusText,
        response: err,
      };
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      error = {
        message:
          err.error instanceof Object
            ? err.error.message
            : err.error || err.message,
        status: err.status,
        statusText: err.statusText,
        response: err,
      };
    }
    return throwError(error);
  }

  private _getApiRootUrl(
    rootUrl: string,
    includeVersionNumber: boolean = false,
    preferPreviousVersion: boolean = false
  ) {
    return this._getInstance().pipe(
      map((instance: Instance) => {
        const version = instance.version;
        const versionNumber =
          version !== 0 ? (version - 1 <= 25 ? version + 1 : version) : '';
        return versionNumber === ''
          ? `${rootUrl}api/`
          : `${rootUrl}api/${
              includeVersionNumber && !preferPreviousVersion
                ? versionNumber + '/'
                : preferPreviousVersion
                ? versionNumber
                  ? versionNumber - 1 + '/'
                  : ''
                : ''
            }`;
      })
    );
  }

  private _getHttpOptions(httpHeaderOptions: any) {
    return httpHeaderOptions
      ? {
          headers: new HttpHeaders({
            ...HTTP_HEADER_OPTIONS,
            ...(httpHeaderOptions || {}),
          }),
        }
      : null;
  }
}
