# ng-dhis2-ui

An angular wrapper library that provide access to the react based DHIS2 UI components in angular applications running in DHIS2 platform

## Library installation

`npm install @iapps/ng-dhis2-ui`

This library wraps most of react based DHIS2 libraries. Following packages should be installed

<!-- TODO: List of dependencies -->

For HTTP request, the library has used [NgxDhis2HttpClient](https://www.npmjs.com/package/@iapps/ngx-dhis2-http-client). Please follow the instructions on how to install and configure

**NOTE**: Under the hood the library uses react library, hence you will need to modify some your `tsconfig.json` under compilerOptions with the following

```javascript
  ........
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "jsx": "react",
    "esModuleInterop": true,
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@iapps/ng-dhis2-ui": ["ng-dhis2-ui/src/index.ts"]
    }
  },
  ......
```

## Local development

If you want to collaborate to the codebase, to run the codebase locally;

1. Clone the source code

`git clone https://github.com/udsm-dhis2-lab/ng-dhis2-ui.git`

2. Install all needed dependencies

`npm install` or `yarn install`

**NOTE**: Sometimes npm installation may failed due to mismatch in resolving package version dependencies. If you are using npm then run `npm install --legacy-peer-deps` to ensure all packages regardless of unmatched dependencies are getting installed. This may however break the code if the packages dependencies are incompatible

3. You will be required to set up a proxy config file named `proxy-config.json`. You can simply copy `proxy-config.example.json` and modify your access credentials to DHIS2 instances to run the demo application.

4. To run the demo app, in order to view and test the components `nx serve demo`

## Deployment

- To build, run `npm run build:dhis2-ui`
- To pack, run `npm run pack:dhis2-ui`
- To publish to npm, run`npm run publish:dhis2-ui`. But you will be required to have access to `@iapps` npm namespace and have already logged in under your terminal. Run `npm login` to login with your terminal
