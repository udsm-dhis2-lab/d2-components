/* tslint:disable:no-unused-variable */

import { of } from 'rxjs';
import { DataStoreService } from './data-store.service';

describe('DataStoreService', () => {
  let httpClientSpy: {
    get: jasmine.Spy;
    post: jasmine.Spy;
    put: jasmine.Spy;
    me: jasmine.Spy;
  };

  let dataStoreService: DataStoreService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('NgxHttpClientService', [
      'get',
      'post',
      'put',
      'me',
    ]);

    dataStoreService = new DataStoreService(httpClientSpy as any);
  });

  it('should create an data store service instance', () => {
    expect(dataStoreService).toBeDefined();
  });

  it('should return datastore results for the given namespace', async () => {
    const dataStoreUrl = 'dataStore/dataStoreNamespace';
    const expectedResult: any = {
      dataStoreNamespace: [],
    };

    httpClientSpy.get.and.returnValue(of([]));
    const dataStoreResult = await dataStoreService
      .get(dataStoreUrl, {})
      .toPromise();

    expect(dataStoreResult).toEqual(expectedResult);
  });

  it('should return datastore results for the given namespace and provided key', async () => {
    const dataStoreUrl = 'dataStore/dataStoreNamespace/datastoreKey';
    const expectedResult: any = {
      id: 'datastoreKey',
      name: 'dateStoreName',
    };

    httpClientSpy.get.and.returnValue(of(expectedResult));
    const dataStoreResult = await dataStoreService
      .get(dataStoreUrl, {})
      .toPromise();

    expect(dataStoreResult).toEqual(expectedResult);
  });
});
