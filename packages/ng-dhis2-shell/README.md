# ng-dhis2-shell

`ng-dhis2-shell` is an angular based library that provide a DHIS2 shell (DHIS2 Header bar, loading, login model etc) on angular application when building DHIS2 based applications. The library wraps [@dhis2/app-shell](https://www.npmjs.com/package/@dhis2/app-shell) which is based on react library.

## Installation

To add `ng-dhis2-shell` , run

`ng add @iapps/ng-dhis2-shell`

The ng add command will perform the following actions:

- Add project dependencies to package.json
- Add AppShellModule imports in `app.module.ts`
- Rewrite the `app.component.ts` file by adding wrapper to `dhis2 shell` component
- Add `manifest.webapp` in the workspace, this is file is needed when building application for installation in DHIS2 instance (You will need to manually add reference of this file in `angular.json` unders assets to have this available during building of application. This will be done automatically in later versions)
- Update `tsconfig.json` file to add relevant properties to allow running react code in angular

## Development environment

For better development experience, add `proxy-config.json` file in your workspace

```json
{
  "/api": {
    "target": "https://play.dhis2.org/40.2.0/",
    "secure": false,
    "auth": "admin:district",
    "changeOrigin": true
  },
  "/dhis-web-commons": {
    "target": "https://play.dhis2.org/40.2.0/",
    "secure": false,
    "auth": "admin:district",
    "changeOrigin": true
  },
  "/icons": {
    "target": "https://play.dhis2.org/40.2.0/",
    "secure": false,
    "auth": "admin:district",
    "changeOrigin": true
  }
}
```
