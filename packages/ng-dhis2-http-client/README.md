# DHIS2 Http Client library

DHIS2 Http Client is angular 6+ library that exposes services for fetching, posting, updating and deleting dhis2 resources, simple configurable index DB support for dhis2 APIs

## Installation

`npm install @iapps/ngx-dhis2-http-client --save`

## Contents

ngx-dhis2-http-client exposes two services .i.e NgxHttpClientService and ManifestService

- NgxHttpClientService: This service exposes all REST-API methods .i.e. GET, POST, PUT, DELETE

  - GET: `get(url: string, httpConfig: HttpConfig)`

  - POST: `post(url: string, data: any, httpConfig: HttpConfig)`

  - PUT: `put(url: string, data: any, httpConfig: HttpConfig)`

  - DELETE `delete(url: string, httpConfig: HttpConfig)`

  where HttpConfig has a data model of

  ```
   {
    includeVersionNumber?: boolean;
    preferPreviousApiVersion?: boolean;
    useRootUrl?: boolean;
    isExternalLink?: boolean;
    useIndexDb?: boolean;
  }
  ```

- ManifestService: This service exposes manifest two methods get() and getRootUrl()
  - get(): This returns payload with the format

```
  {
    name: string;
    version: number | string;
    description: string;
    launch_path: string;
    appType: string;
    icons: {
      16: string;
      48: string;
      128: string;
    };
    developer: {
      name: string;
      url: string;
    };
    default_locale: string;
    activities: {
    dhis: {
      href: string;
      namespace: string;
      };
    };
    authorities: Array<string>;
}
```

- getRootUrl(): This method returns rootUrl as specified in the manifest file in activities.dhis.href. This method will return `../../../` if manifest file could not be loaded or href is not specified

## Usage

**1. Import NgxDhis2HttpClientModule:**

You have to import NgxDhis2HttpClientModule.forRoot() in the root NgModule of your application

This library support index DB as based on [dexie library](https://dexie.org/). In order to initiatiate index db then you have to passed index db configuration in forRoot of the module, so in app.module.ts

```ts
........
@NgModule({
  declarations: [AppComponent, ...fromPages.pages],
  imports: [
   ..........
    NgxDhis2HttpClientModule.forRoot({
      namespace: 'iapps',
      version: 1,
      models: {
        users: 'id',
        dataElements: 'id',
        .......
      }
    })
    .......
    ]
    ......
    })
```

where in the models, for example user will be a table "users" and 'id' will be a keyIndex for the table

**2. Injecting in services**

Inject NgxHttpClientService or ManifestService any where in constructor in your angular application eg

```ts
 import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
 ...
 constructor(private http: NgxDhis2HttpClientService) {
  }
 ...
```
