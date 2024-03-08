/* tslint:disable:no-unused-variable */

import { of } from 'rxjs';
import { NgxDhis2HttpClientService } from './http-client.service';

describe('HttpClientService', () => {
  let httpClientSpy: {
    get: jasmine.Spy;
    post: jasmine.Spy;
    put: jasmine.Spy;
    me: jasmine.Spy;
  };

  let manifestSpy: {
    getManifest: jasmine.Spy;
  };

  let systemInfoSpy: {
    get: jasmine.Spy;
    post: jasmine.Spy;
    put: jasmine.Spy;
    me: jasmine.Spy;
  };

  let indexDbSpy: {
    get: jasmine.Spy;
    post: jasmine.Spy;
    put: jasmine.Spy;
    me: jasmine.Spy;
  };

  let userSpy: {
    getCurrentUser: jasmine.Spy;
  };

  let dataStoreSpy: {
    get: jasmine.Spy;
  };

  let httpClientService: NgxDhis2HttpClientService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('NgxHttpClientService', [
      'get',
      'post',
      'put',
      'me',
    ]);

    manifestSpy = jasmine.createSpyObj('ManifestService', ['getManifest']);
    systemInfoSpy = jasmine.createSpyObj('SytemInfoService', ['get']);
    indexDbSpy = jasmine.createSpyObj('IndexDbService', [
      'findById',
      'findAll',
      'saveOne',
      'saveBulk',
    ]);
    userSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    dataStoreSpy = jasmine.createSpyObj('DataStoreService', ['get']);

    httpClientSpy.get.and.returnValue(of({}));
    systemInfoSpy.get.and.returnValue(of({}));
    manifestSpy.getManifest.and.returnValue(of({}));
    userSpy.getCurrentUser.and.returnValue(of({}));
    httpClientService = new NgxDhis2HttpClientService(
      httpClientSpy as any,
      manifestSpy as any,
      systemInfoSpy as any,
      indexDbSpy as any,
      userSpy as any,
      dataStoreSpy as any
    );
  });

  it('should create an http client service instance', () => {
    expect(httpClientService).toBeDefined();
  });

  it('should return list of expected organisation units', () => {
    const apiUrl = 'organisationUnits';
    const expectedPayload: any = {
      organisationUnits: [
        {
          id: 'parent',
          name: 'Parent One',
        },
      ],
    };

    httpClientSpy.get.and.returnValue(of(expectedPayload));
    httpClientService.get(apiUrl).subscribe((organisationUnits) => {
      expect(organisationUnits).toEqual(expectedPayload);
    });
  });
});
